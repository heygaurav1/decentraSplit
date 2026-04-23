import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("DecentraSplit", function () {
  let decentraSplit;
  let owner, alice, bob, charlie, dave;

  beforeEach(async function () {
    [owner, alice, bob, charlie, dave] = await ethers.getSigners();
    const DecentraSplit = await ethers.getContractFactory("DecentraSplit");
    decentraSplit = await DecentraSplit.deploy();
    await decentraSplit.waitForDeployment();
  });

  // ─── Group Creation ──────────────────────────────────────────────

  describe("Group Creation", function () {
    it("should create a group with members", async function () {
      const tx = await decentraSplit.createGroup("Trip to Goa", [
        alice.address,
        bob.address,
        charlie.address,
      ]);
      await tx.wait();

      const group = await decentraSplit.getGroup(0);
      expect(group.name).to.equal("Trip to Goa");
      expect(group.creator).to.equal(owner.address);
      // owner + 3 members = 4
      expect(group.members.length).to.equal(4);
    });

    it("should add creator automatically as member", async function () {
      await decentraSplit.createGroup("Test", [alice.address]);
      const members = await decentraSplit.getGroupMembers(0);
      expect(members).to.include(owner.address);
    });

    it("should not create group with empty name", async function () {
      await expect(
        decentraSplit.createGroup("", [alice.address])
      ).to.be.revertedWith("Group name required");
    });

    it("should not create group with zero members", async function () {
      await expect(
        decentraSplit.createGroup("Test", [])
      ).to.be.revertedWith("Need at least 1 member");
    });

    it("should track user groups", async function () {
      await decentraSplit.createGroup("Group1", [alice.address]);
      await decentraSplit.createGroup("Group2", [alice.address]);

      const aliceGroups = await decentraSplit.getUserGroups(alice.address);
      expect(aliceGroups.length).to.equal(2);
    });
  });

  // ─── Adding Expenses ─────────────────────────────────────────────

  describe("Adding Expenses", function () {
    beforeEach(async function () {
      // Create a group: owner, alice, bob, charlie
      await decentraSplit.createGroup("Trip", [
        alice.address,
        bob.address,
        charlie.address,
      ]);
    });

    it("should add an expense and update balances", async function () {
      // Owner pays 1000 wei, split among owner, alice, bob, charlie (4 people)
      const amount = 1000n;
      await decentraSplit.addExpense(
        0,
        amount,
        [owner.address, alice.address, bob.address, charlie.address],
        "Dinner"
      );

      // Each owes 250. Owner paid, so owner is owed 750 net.
      const ownerBal = await decentraSplit.getBalance(0, owner.address);
      expect(ownerBal).to.equal(750n);

      const aliceBal = await decentraSplit.getBalance(0, alice.address);
      expect(aliceBal).to.equal(-250n);

      const bobBal = await decentraSplit.getBalance(0, bob.address);
      expect(bobBal).to.equal(-250n);

      const charlieBal = await decentraSplit.getBalance(0, charlie.address);
      expect(charlieBal).to.equal(-250n);
    });

    it("should track pairwise debts correctly", async function () {
      const amount = 1200n;
      await decentraSplit.addExpense(
        0,
        amount,
        [owner.address, alice.address, bob.address, charlie.address],
        "Hotel"
      );

      // Each share = 300. alice, bob, charlie each owe owner 300.
      expect(await decentraSplit.getDebt(0, alice.address, owner.address)).to.equal(300n);
      expect(await decentraSplit.getDebt(0, bob.address, owner.address)).to.equal(300n);
      expect(await decentraSplit.getDebt(0, charlie.address, owner.address)).to.equal(300n);
    });

    it("should reject expense from non-member", async function () {
      await expect(
        decentraSplit.connect(dave).addExpense(0, 100, [owner.address], "Food")
      ).to.be.revertedWith("Not a group member");
    });

    it("should reject zero amount", async function () {
      await expect(
        decentraSplit.addExpense(0, 0, [owner.address], "Nothing")
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("should handle multiple expenses correctly", async function () {
      // Owner pays 1000 split 4 ways → each owes 250 to owner
      await decentraSplit.addExpense(
        0,
        1000,
        [owner.address, alice.address, bob.address, charlie.address],
        "Dinner"
      );

      // Alice pays 800 split 4 ways → each owes 200 to alice
      await decentraSplit.connect(alice).addExpense(
        0,
        800,
        [owner.address, alice.address, bob.address, charlie.address],
        "Cab"
      );

      // Owner: +750 (from dinner) - 200 (owes alice for cab) = +550
      const ownerBal = await decentraSplit.getBalance(0, owner.address);
      expect(ownerBal).to.equal(550n);

      // Alice: -250 (owes owner for dinner) + 600 (owed from cab) = +350
      const aliceBal = await decentraSplit.getBalance(0, alice.address);
      expect(aliceBal).to.equal(350n);
    });

    it("should store expense details correctly", async function () {
      await decentraSplit.addExpense(
        0,
        500,
        [owner.address, alice.address],
        "Snacks"
      );

      const expense = await decentraSplit.getExpense(0, 0);
      expect(expense.payer).to.equal(owner.address);
      expect(expense.amount).to.equal(500n);
      expect(expense.description).to.equal("Snacks");
      expect(expense.participants.length).to.equal(2);
    });
  });

  // ─── Settlement ──────────────────────────────────────────────────

  describe("Settlement", function () {
    beforeEach(async function () {
      await decentraSplit.createGroup("Trip", [
        alice.address,
        bob.address,
      ]);

      // Owner pays 900, split among owner, alice, bob → each owes 300
      await decentraSplit.addExpense(
        0,
        900,
        [owner.address, alice.address, bob.address],
        "Hotel"
      );
    });

    it("should settle debt with ETH transfer", async function () {
      // Alice owes owner 300
      const debtBefore = await decentraSplit.getDebt(0, alice.address, owner.address);
      expect(debtBefore).to.equal(300n);

      const ownerBalBefore = await ethers.provider.getBalance(owner.address);

      // Alice settles 300 with owner
      await decentraSplit.connect(alice).settle(0, owner.address, { value: 300n });

      const debtAfter = await decentraSplit.getDebt(0, alice.address, owner.address);
      expect(debtAfter).to.equal(0n);

      const ownerBalAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalAfter - ownerBalBefore).to.equal(300n);
    });

    it("should allow partial settlement", async function () {
      await decentraSplit.connect(bob).settle(0, owner.address, { value: 100n });
      const debt = await decentraSplit.getDebt(0, bob.address, owner.address);
      expect(debt).to.equal(200n);
    });

    it("should reject overpayment", async function () {
      await expect(
        decentraSplit.connect(alice).settle(0, owner.address, { value: 500n })
      ).to.be.revertedWith("Sending more than owed");
    });

    it("should reject settling with yourself", async function () {
      await expect(
        decentraSplit.connect(alice).settle(0, alice.address, { value: 100n })
      ).to.be.revertedWith("Cannot settle with yourself");
    });

    it("should reject settling with zero value", async function () {
      await expect(
        decentraSplit.connect(alice).settle(0, owner.address, { value: 0n })
      ).to.be.revertedWith("Send ETH to settle");
    });

    it("should update net balances after settlement", async function () {
      // Alice: -300, Owner: +600
      await decentraSplit.connect(alice).settle(0, owner.address, { value: 300n });

      const aliceBal = await decentraSplit.getBalance(0, alice.address);
      expect(aliceBal).to.equal(0n);

      const ownerBal = await decentraSplit.getBalance(0, owner.address);
      expect(ownerBal).to.equal(300n); // Still owed 300 by bob
    });

    it("should record settlement history", async function () {
      await decentraSplit.connect(alice).settle(0, owner.address, { value: 300n });

      const settlement = await decentraSplit.settlements(0);
      expect(settlement.from).to.equal(alice.address);
      expect(settlement.to).to.equal(owner.address);
      expect(settlement.amount).to.equal(300n);
    });
  });
});
