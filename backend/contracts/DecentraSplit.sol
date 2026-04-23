// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DecentraSplit
 * @dev Trustless group expense settlement on blockchain.
 *      Groups can split expenses and settle payments transparently.
 */
contract DecentraSplit {

    // ─── Data Structures ───────────────────────────────────────────────

    struct Expense {
        uint256 id;
        uint256 groupId;
        address payer;
        uint256 amount;
        address[] participants;
        string description;
        uint256 timestamp;
    }

    struct Group {
        uint256 id;
        string name;
        address creator;
        address[] members;
        uint256 expenseCount;
        uint256 totalExpenses;
        uint256 createdAt;
        bool exists;
    }

    struct Settlement {
        address from;
        address to;
        uint256 amount;
        uint256 groupId;
        uint256 timestamp;
    }

    // ─── State ─────────────────────────────────────────────────────────

    uint256 public groupCount;
    uint256 public expenseCount;
    uint256 public settlementCount;

    // groupId => Group
    mapping(uint256 => Group) public groups;

    // groupId => expenseIndex => Expense
    mapping(uint256 => mapping(uint256 => Expense)) public expenses;

    // groupId => member => balance (positive = owed money, negative = owes money)
    // We use int256 for net balances
    mapping(uint256 => mapping(address => int256)) public balances;

    // groupId => from => to => amount owed (detailed pairwise debts)
    mapping(uint256 => mapping(address => mapping(address => uint256))) public debts;

    // settlementId => Settlement
    mapping(uint256 => Settlement) public settlements;

    // address => groupIds[]
    mapping(address => uint256[]) public userGroups;

    // groupId => address => isMember
    mapping(uint256 => mapping(address => bool)) public isMember;

    // ─── Events ────────────────────────────────────────────────────────

    event GroupCreated(uint256 indexed groupId, string name, address indexed creator, address[] members);
    event MemberAdded(uint256 indexed groupId, address indexed member);
    event ExpenseAdded(uint256 indexed groupId, uint256 indexed expenseId, address indexed payer, uint256 amount, string description);
    event DebtSettled(uint256 indexed groupId, address indexed from, address indexed to, uint256 amount);

    // ─── Modifiers ─────────────────────────────────────────────────────

    modifier onlyMember(uint256 _groupId) {
        require(groups[_groupId].exists, "Group does not exist");
        require(isMember[_groupId][msg.sender], "Not a group member");
        _;
    }

    modifier groupExists(uint256 _groupId) {
        require(groups[_groupId].exists, "Group does not exist");
        _;
    }

    // ─── Group Management ──────────────────────────────────────────────

    /**
     * @dev Create a new group with given name and members.
     *      The creator is automatically added as a member.
     */
    function createGroup(string memory _name, address[] memory _members) external returns (uint256) {
        require(bytes(_name).length > 0, "Group name required");
        require(_members.length > 0, "Need at least 1 member");

        uint256 groupId = groupCount;
        groupCount++;

        Group storage g = groups[groupId];
        g.id = groupId;
        g.name = _name;
        g.creator = msg.sender;
        g.createdAt = block.timestamp;
        g.exists = true;

        // Add creator first
        _addMemberInternal(groupId, msg.sender);

        // Add other members
        for (uint256 i = 0; i < _members.length; i++) {
            if (!isMember[groupId][_members[i]]) {
                _addMemberInternal(groupId, _members[i]);
            }
        }

        emit GroupCreated(groupId, _name, msg.sender, g.members);
        return groupId;
    }

    /**
     * @dev Add a new member to an existing group. Only current members can add.
     */
    function addMember(uint256 _groupId, address _member) external onlyMember(_groupId) {
        require(_member != address(0), "Invalid address");
        require(!isMember[_groupId][_member], "Already a member");

        _addMemberInternal(_groupId, _member);
        emit MemberAdded(_groupId, _member);
    }

    function _addMemberInternal(uint256 _groupId, address _member) internal {
        groups[_groupId].members.push(_member);
        isMember[_groupId][_member] = true;
        userGroups[_member].push(_groupId);
    }

    // ─── Expense Management ────────────────────────────────────────────

    /**
     * @dev Add an expense to a group. The caller (msg.sender) is the payer.
     *      The expense is split equally among all participants.
     */
    function addExpense(
        uint256 _groupId,
        uint256 _amount,
        address[] memory _participants,
        string memory _description
    ) external onlyMember(_groupId) returns (uint256) {
        require(_amount > 0, "Amount must be > 0");
        require(_participants.length > 0, "Need participants");

        // Verify all participants are group members
        for (uint256 i = 0; i < _participants.length; i++) {
            require(isMember[_groupId][_participants[i]], "Participant not in group");
        }

        uint256 eId = expenseCount;
        expenseCount++;

        // Store expense
        Expense storage e = expenses[_groupId][groups[_groupId].expenseCount];
        e.id = eId;
        e.groupId = _groupId;
        e.payer = msg.sender;
        e.amount = _amount;
        e.participants = _participants;
        e.description = _description;
        e.timestamp = block.timestamp;

        groups[_groupId].expenseCount++;
        groups[_groupId].totalExpenses += _amount;

        // Calculate split
        uint256 splitAmount = _amount / _participants.length;
        uint256 remainder = _amount - (splitAmount * _participants.length);

        // Update balances: each participant owes their share
        for (uint256 i = 0; i < _participants.length; i++) {
            if (_participants[i] != msg.sender) {
                // This participant owes the payer
                debts[_groupId][_participants[i]][msg.sender] += splitAmount;
                balances[_groupId][_participants[i]] -= int256(splitAmount);
                balances[_groupId][msg.sender] += int256(splitAmount);
            }
        }

        // Give remainder to payer's credit (handles rounding)
        if (remainder > 0) {
            balances[_groupId][msg.sender] += int256(remainder);
        }

        emit ExpenseAdded(_groupId, eId, msg.sender, _amount, _description);
        return eId;
    }

    // ─── Settlement ────────────────────────────────────────────────────

    /**
     * @dev Settle a debt by sending ETH to the creditor.
     *      The msg.value is the amount being settled.
     */
    function settle(uint256 _groupId, address payable _to) external payable onlyMember(_groupId) {
        require(msg.value > 0, "Send ETH to settle");
        require(isMember[_groupId][_to], "Recipient not in group");
        require(msg.sender != _to, "Cannot settle with yourself");

        uint256 owed = debts[_groupId][msg.sender][_to];
        require(owed > 0, "You don't owe this person");
        require(msg.value <= owed, "Sending more than owed");

        // Update debts
        debts[_groupId][msg.sender][_to] -= msg.value;

        // Update net balances
        balances[_groupId][msg.sender] += int256(msg.value);
        balances[_groupId][_to] -= int256(msg.value);

        // Record settlement
        settlements[settlementCount] = Settlement({
            from: msg.sender,
            to: _to,
            amount: msg.value,
            groupId: _groupId,
            timestamp: block.timestamp
        });
        settlementCount++;

        // Transfer ETH to creditor
        (bool sent, ) = _to.call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        emit DebtSettled(_groupId, msg.sender, _to, msg.value);
    }

    // ─── View Functions ────────────────────────────────────────────────

    /**
     * @dev Get all members of a group.
     */
    function getGroupMembers(uint256 _groupId) external view groupExists(_groupId) returns (address[] memory) {
        return groups[_groupId].members;
    }

    /**
     * @dev Get the net balance of a member in a group.
     *      Positive = others owe you, Negative = you owe others.
     */
    function getBalance(uint256 _groupId, address _member) external view groupExists(_groupId) returns (int256) {
        return balances[_groupId][_member];
    }

    /**
     * @dev Get how much `_from` owes `_to` in a specific group.
     */
    function getDebt(uint256 _groupId, address _from, address _to) external view groupExists(_groupId) returns (uint256) {
        return debts[_groupId][_from][_to];
    }

    /**
     * @dev Get all group IDs a user belongs to.
     */
    function getUserGroups(address _user) external view returns (uint256[] memory) {
        return userGroups[_user];
    }

    /**
     * @dev Get an expense by group and index.
     */
    function getExpense(uint256 _groupId, uint256 _index) external view groupExists(_groupId) returns (
        uint256 id,
        address payer,
        uint256 amount,
        address[] memory participants,
        string memory description,
        uint256 timestamp
    ) {
        require(_index < groups[_groupId].expenseCount, "Invalid expense index");
        Expense storage e = expenses[_groupId][_index];
        return (e.id, e.payer, e.amount, e.participants, e.description, e.timestamp);
    }

    /**
     * @dev Get group details.
     */
    function getGroup(uint256 _groupId) external view groupExists(_groupId) returns (
        uint256 id,
        string memory name,
        address creator,
        address[] memory members,
        uint256 expCount,
        uint256 totalExp,
        uint256 createdAt
    ) {
        Group storage g = groups[_groupId];
        return (g.id, g.name, g.creator, g.members, g.expenseCount, g.totalExpenses, g.createdAt);
    }
}
