import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DecentraSplitContract from './contracts/DecentraSplit.json';

// --- Types ---
interface Group {
  id: number;
  name: string;
  creator: string;
  members: string[];
  expenseCount: number;
  totalExpenses: string;
  createdAt: number;
}

interface Expense {
  id: number;
  payer: string;
  amount: string;
  description: string;
  participants: string[];
  timestamp: number;
}

interface Balance {
  address: string;
  amount: string; // Positive means they are owed, negative means they owe
}

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState<string[]>([]);

  const connectWallet = async () => {
    // Check for demo mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      setAccount('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      setGroups([
        {
          id: 0,
          name: 'Goa Trip 2024',
          creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          members: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'],
          expenseCount: 2,
          totalExpenses: '0.45',
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 2
        }
      ]);
      return;
    }

    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setAccount(accounts[0]);

        const contractInstance = new ethers.Contract(
          DecentraSplitContract.address,
          DecentraSplitContract.abi,
          signer
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const loadGroups = async () => {
    if (!contract || !account) return;
    try {
      const groupIds = await contract.getUserGroups(account);
      const loadedGroups = [];
      for (const id of groupIds) {
        const g = await contract.getGroup(id);
        loadedGroups.push({
          id: Number(g[0]),
          name: g[1],
          creator: g[2],
          members: Array.from(g[3]),
          expenseCount: Number(g[4]),
          totalExpenses: ethers.formatEther(g[5]),
          createdAt: Number(g[6])
        });
      }
      setGroups(loadedGroups);
    } catch (error) {
      console.error("Load groups error:", error);
    }
  };

  const loadGroupDetails = async (groupId: number) => {
    // Demo Mode Logic
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      setSelectedGroupId(groupId);
      setExpenses([
        { id: 1, payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.3', description: 'Beach Resort Stay', participants: [], timestamp: Math.floor(Date.now() / 1000) - 3600 },
        { id: 0, payer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '0.15', description: 'Scuba Diving', participants: [], timestamp: Math.floor(Date.now() / 1000) - 7200 }
      ]);
      setBalances([
        { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.1' },
        { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '-0.05' },
        { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', amount: '-0.05' }
      ]);
      return;
    }

    if (!contract) return;
    setLoading(true);
    try {
      setSelectedGroupId(groupId);
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      // Load expenses
      const loadedExpenses = [];
      for (let i = 0; i < group.expenseCount; i++) {
        const e = await contract.getExpense(groupId, i);
        loadedExpenses.push({
          id: Number(e[0]),
          payer: e[1],
          amount: ethers.formatEther(e[2]),
          participants: Array.from(e[3]),
          description: e[4],
          timestamp: Number(e[5])
        });
      }
      setExpenses(loadedExpenses.reverse());

      // Load balances
      const loadedBalances = [];
      for (const member of group.members) {
        const bal = await contract.getBalance(groupId, member);
        loadedBalances.push({
          address: member,
          amount: ethers.formatEther(bal)
        });
      }
      setBalances(loadedBalances);
    } catch (error) {
      console.error("Load details error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !newGroupName) return;
    setLoading(true);
    try {
      const memberArray = newGroupMembers.split(',').map(m => m.trim()).filter(m => ethers.isAddress(m));
      const tx = await contract.createGroup(newGroupName, memberArray);
      await tx.wait();
      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupMembers('');
      loadGroups();
    } catch (error) {
      console.error("Create group error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || selectedGroupId === null) return;
    setLoading(true);
    try {
      const amountWei = ethers.parseEther(expenseAmount);
      const tx = await contract.addExpense(selectedGroupId, amountWei, expenseParticipants, expenseDesc);
      await tx.wait();
      setShowAddExpense(false);
      setExpenseAmount('');
      setExpenseDesc('');
      loadGroupDetails(selectedGroupId);
    } catch (error) {
      console.error("Add expense error:", error);
    } finally {
      setLoading(false);
    }
  };

  const settleDebt = async (to: string, amount: string) => {
    if (!contract || selectedGroupId === null) return;
    setLoading(true);
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.settle(selectedGroupId, to, { value: amountWei });
      await tx.wait();
      loadGroupDetails(selectedGroupId);
    } catch (error) {
      console.error("Settle error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) loadGroups();
  }, [contract, account]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-500/20">
            D
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DecentraSplit</h1>
        </div>
        {account ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block glass px-4 py-2 rounded-xl text-sm font-medium border-white/5">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            <button className="btn-secondary py-2 px-4" onClick={() => setAccount(null)}>
              Disconnect
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-8">
        {!account ? (
          <div className="text-center py-32 glass rounded-3xl border-dashed border-2 border-white/10">
            <h2 className="text-5xl font-bold mb-6 text-gradient">Expenses, but trustless.</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
              Split bills with friends on the blockchain. No middleman, no disputes, just pure transparency.
            </p>
            <button className="btn-primary mx-auto text-lg px-8 py-4" onClick={connectWallet}>
              Get Started Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Groups */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Your Groups</h3>
                <button 
                  className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                  onClick={() => setShowCreateGroup(true)}
                >
                  +
                </button>
              </div>

              <div className="space-y-3">
                {groups.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">No groups yet. Create one!</p>
                ) : (
                  groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => loadGroupDetails(g.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${
                        selectedGroupId === g.id ? 'glass bg-white/10 border-primary-500/30' : 'glass-card'
                      }`}
                    >
                      <h4 className="font-bold text-lg">{g.name}</h4>
                      <div className="flex justify-between mt-2 text-sm text-slate-400">
                        <span>{g.members.length} members</span>
                        <span className="text-primary-400 font-medium">Ξ {g.totalExpenses}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Main Section: Group Content */}
            <div className="lg:col-span-8">
              {selectedGroupId === null ? (
                <div className="h-full min-h-[400px] glass rounded-3xl flex flex-col items-center justify-center text-slate-500 border-dashed border-2 border-white/5">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-3xl">
                    ←
                  </div>
                  <p>Select a group to see details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group Header */}
                  <div className="glass p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px] -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-3xl font-bold mb-1">{selectedGroup?.name}</h2>
                          <p className="text-slate-400 text-sm">Created on {new Date((selectedGroup?.createdAt || 0) * 1000).toLocaleDateString()}</p>
                        </div>
                        <button className="btn-primary py-2 px-6" onClick={() => {
                          setExpenseParticipants(selectedGroup?.members || []);
                          setShowAddExpense(true);
                        }}>
                          Add Expense
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                        <div className="glass bg-white/5 p-4 rounded-2xl">
                          <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Total spent</p>
                          <p className="text-xl font-bold">Ξ {selectedGroup?.totalExpenses}</p>
                        </div>
                        <div className="glass bg-white/5 p-4 rounded-2xl">
                          <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Expenses</p>
                          <p className="text-xl font-bold">{selectedGroup?.expenseCount}</p>
                        </div>
                        <div className="glass bg-white/5 p-4 rounded-2xl">
                          <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Members</p>
                          <p className="text-xl font-bold">{selectedGroup?.members.length}</p>
                        </div>
                        <div className="glass bg-white/5 p-4 rounded-2xl border-primary-500/20">
                          <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Your Balance</p>
                          <p className={`text-xl font-bold ${Number(balances.find(b => b.address.toLowerCase() === account.toLowerCase())?.amount || 0) >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                            {Number(balances.find(b => b.address.toLowerCase() === account.toLowerCase())?.amount || 0) >= 0 ? '+' : ''}
                            {balances.find(b => b.address.toLowerCase() === account.toLowerCase())?.amount || '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs: Balances & Expenses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Balances List */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                        Settlements
                      </h4>
                      <div className="space-y-3">
                        {balances.map(b => {
                          const amt = Number(b.amount);
                          if (amt >= 0 || b.address.toLowerCase() === account.toLowerCase()) return null;
                          return (
                            <div key={b.address} className="glass-card p-4 rounded-2xl flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm text-slate-300">{b.address.slice(0,6)}...{b.address.slice(-4)}</p>
                                <p className="text-rose-400 text-lg font-bold">Owes Ξ {Math.abs(amt).toFixed(4)}</p>
                              </div>
                              <button 
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm font-bold border border-rose-500/20 transition-all"
                                onClick={() => settleDebt(b.address, Math.abs(amt).toString())}
                              >
                                Settle
                              </button>
                            </div>
                          );
                        })}
                        {balances.every(b => Number(b.amount) >= 0 || b.address.toLowerCase() === account.toLowerCase()) && (
                          <p className="text-slate-500 text-sm italic py-4">Everyone is settled up!</p>
                        )}
                      </div>
                    </div>

                    {/* Expense History */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        Recent Activity
                      </h4>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {expenses.length === 0 ? (
                          <p className="text-slate-500 text-sm italic py-4">No expenses recorded yet.</p>
                        ) : (
                          expenses.map(e => (
                            <div key={e.id} className="glass-card p-4 rounded-2xl">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-slate-200">{e.description}</h5>
                                <span className="text-primary-400 font-bold">Ξ {e.amount}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-slate-400">
                                <span>Paid by {e.payer.slice(0,6)}...</span>
                                <span>{new Date(e.timestamp * 1000).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateGroup(false)}></div>
          <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10 border-white/10">
            <h3 className="text-2xl font-bold mb-6">Create New Group</h3>
            <form onSubmit={createGroup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 ml-1">Group Name</label>
                <input 
                  type="text" 
                  className="w-full" 
                  placeholder="e.g. Weekend Trip"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400 ml-1">Member Addresses (comma separated)</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all min-h-[100px]" 
                  placeholder="0x..., 0x..."
                  value={newGroupMembers}
                  onChange={(e) => setNewGroupMembers(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreateGroup(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddExpense(false)}></div>
          <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10 border-white/10">
            <h3 className="text-2xl font-bold mb-6">Add Expense</h3>
            <form onSubmit={addExpense} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 ml-1">Amount (ETH)</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  className="w-full" 
                  placeholder="0.05"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400 ml-1">Description</label>
                <input 
                  type="text" 
                  className="w-full" 
                  placeholder="e.g. Dinner at Beach"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400 ml-1">Split Between</label>
                <div className="max-h-[150px] overflow-y-auto space-y-2 p-2 bg-white/5 rounded-xl border border-white/10">
                  {selectedGroup?.members.map(member => (
                    <label key={member} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-md border-white/20 bg-transparent text-primary-500 focus:ring-offset-0 focus:ring-primary-500"
                        checked={expenseParticipants.includes(member)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExpenseParticipants([...expenseParticipants, member]);
                          } else {
                            setExpenseParticipants(expenseParticipants.filter(m => m !== member));
                          }
                        }}
                      />
                      <span className="text-sm text-slate-300 font-medium">{member === account ? 'Me' : `${member.slice(0,6)}...${member.slice(-4)}`}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowAddExpense(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
