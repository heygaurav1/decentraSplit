import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Wallet, 
  ArrowUpRight, 
  History, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  RefreshCw,
  LayoutDashboard,
  Info,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DecentraSplitContract from './contracts/DecentraSplit.json';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

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
  amount: string;
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
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

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
      setView('dashboard');
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
        setView('dashboard');
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
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#6366f1', '#10b981']
      });

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
    <div className="min-h-screen selection:bg-primary-500/30 font-sans">
      {/* Dynamic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${view === 'dashboard' ? 'glass border-b border-white/5 py-4' : 'py-6 px-4 sm:px-12 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setView('landing')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-xl shadow-primary-500/20 rotate-3">
              D
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter leading-none">DecentraSplit</h1>
              <span className="text-[8px] font-bold text-primary-400 uppercase tracking-widest mt-1">v1.0 Protocol</span>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            {view === 'landing' && (
              <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                <a href="#security" className="hover:text-white transition-colors">Security</a>
              </div>
            )}
            
            {account ? (
              <div className="flex items-center gap-4">
                <button 
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'glass bg-white/5 hover:bg-white/10'}`}
                  onClick={() => setView('dashboard')}
                >
                  Dashboard
                </button>
                <div className="hidden sm:flex items-center gap-2 glass px-3 py-2 rounded-xl text-[10px] font-bold border-white/5 bg-white/5 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  {account.slice(0, 4)}...{account.slice(-4)}
                </div>
              </div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary py-2 px-6 text-sm" 
                onClick={connectWallet}
              >
                Connect Wallet
              </motion.button>
            )}
          </div>
        </div>
      </nav>

      {/* View Switcher */}
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-32"
          >
            {/* HERO SECTION */}
            <section className="max-w-7xl mx-auto px-6 text-center pb-32">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 border-white/10 text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-10">
                  <ShieldCheck size={12} /> The Future of Social Finance
                </div>
                <h1 className="text-6xl sm:text-8xl font-black mb-8 text-gradient tracking-tighter leading-tight">
                  Settle debts. <br /> Zero trust required.
                </h1>
                <p className="text-slate-400 text-lg sm:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
                  DecentraSplit brings transparency to group expenses. No more manual tracking, no more disputes. Just pure, immutable blockchain logic.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-lg px-12 py-5 rounded-2xl w-full sm:w-auto" 
                    onClick={connectWallet}
                  >
                    Open Protocol <ArrowRight size={20} />
                  </motion.button>
                  <button className="btn-secondary text-lg px-12 py-5 rounded-2xl w-full sm:w-auto">
                    Read Whitepaper
                  </button>
                </div>
              </motion.div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="bg-white/2 py-32 px-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                  <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Powerful Features</h2>
                  <p className="text-slate-500 max-w-xl mx-auto">Everything you need to manage group finances with 100% mathematical certainty.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { icon: <Zap className="text-yellow-400" />, title: 'Real-time Sync', desc: 'Expenses are reflected instantly across the network using decentralized event listeners.' },
                    { icon: <Globe className="text-blue-400" />, title: 'Global Protocol', desc: 'Split bills across borders with no FX fees, settled directly in native cryptocurrency.' },
                    { icon: <Lock className="text-green-400" />, title: 'Immutable Logic', desc: 'Debts are calculated by open-source smart contracts. No admin can delete your records.' },
                    { icon: <RefreshCw className="text-indigo-400" />, title: 'Auto-Settlement', desc: 'Send ETH directly to creditors. The contract handles the ledger updates automatically.' },
                    { icon: <ShieldCheck className="text-rose-400" />, title: 'Fraud Proof', desc: 'Transparent history ensures every single penny is accounted for on the public ledger.' },
                    { icon: <LayoutDashboard className="text-sky-400" />, title: 'Rich Analytics', desc: 'Visualize your spending habits and group dynamics with our premium dashboard interface.' },
                  ].map((f, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -10 }}
                      className="glass-card p-10 rounded-[40px] border-white/5"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-inner">
                        {f.icon}
                      </div>
                      <h3 className="text-xl font-black mb-4 tracking-tight">{f.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" className="py-32 px-6">
              <div className="max-w-5xl mx-auto">
                 <div className="text-center mb-20">
                  <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Simple Protocol Flow</h2>
                  <p className="text-slate-500">From trip planning to full settlement in three easy steps.</p>
                </div>

                <div className="space-y-24">
                  {[
                    { step: '01', title: 'Create your Group', desc: 'Initialize a group on-chain. Add your friends by their wallet addresses. This creates a dedicated ledger for your trip or expense.', img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800' },
                    { step: '02', title: 'Add Expenses', desc: 'Whenever someone pays, log the amount and description. The smart contract calculates everyone\'s share and updates global balances instantly.', img: 'https://images.unsplash.com/photo-1621416848446-99520c915963?auto=format&fit=crop&q=80&w=800' },
                    { step: '03', title: 'Settle On-chain', desc: 'Use the "Settle" function to pay back what you owe. ETH moves from your wallet to theirs, and the contract clears the debt forever.', img: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=800' },
                  ].map((s, i) => (
                    <div key={i} className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="flex-1">
                        <span className="text-6xl font-black text-white/5 mb-4 block tracking-tighter">{s.step}</span>
                        <h3 className="text-3xl font-black mb-6 tracking-tight">{s.title}</h3>
                        <p className="text-slate-400 text-lg leading-relaxed">{s.desc}</p>
                      </div>
                      <div className="flex-1 w-full h-[300px] rounded-[40px] overflow-hidden glass border-white/10 relative group">
                        <img src={s.img} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" alt={s.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECURITY SECTION */}
            <section id="security" className="py-32 px-6 bg-white/2 relative">
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
               <div className="max-w-7xl mx-auto text-center">
                  <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-10 border border-primary-500/20 text-primary-500">
                    <ShieldCheck size={48} />
                  </div>
                  <h2 className="text-5xl font-black mb-6 tracking-tight uppercase">Audited Math. No Hacks.</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-12">
                    Our smart contract code is public, verified, and immutable. We use advanced overflow protection and strictly enforce pairwise debt tracking to ensure your funds are always safe.
                  </p>
                  <div className="flex justify-center gap-12 text-slate-500">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-white">0%</span>
                      <span className="text-[10px] font-black uppercase tracking-widest mt-1">Slippage</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-white">100%</span>
                      <span className="text-[10px] font-black uppercase tracking-widest mt-1">Transparency</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-white">∞</span>
                      <span className="text-[10px] font-black uppercase tracking-widest mt-1">Uptime</span>
                    </div>
                  </div>
               </div>
            </section>

            {/* FOOTER */}
            <footer className="py-20 px-6 border-t border-white/5">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex flex-col items-center md:items-start">
                   <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-lg rotate-3">D</div>
                    <h2 className="text-xl font-black tracking-tighter">DecentraSplit</h2>
                  </div>
                  <p className="text-slate-500 text-sm">Building the trustless social layer of Web3.</p>
                </div>
                <div className="flex gap-8 text-slate-500 text-sm font-bold uppercase tracking-widest">
                  <a href="#" className="hover:text-white transition-colors">Github</a>
                  <a href="#" className="hover:text-white transition-colors">Docs</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                </div>
                <p className="text-slate-600 text-xs">© 2024 Team Alpha Dev. All Rights Reserved.</p>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="pt-28 pb-20 px-4 sm:px-12"
          >
            {/* DASHBOARD UI (EXACTLY AS BEFORE BUT REFINED) */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                      <Users size={20} className="text-primary-400" />
                      Your Ledger
                    </h3>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-xl glass flex items-center justify-center border-white/10"
                      onClick={() => setShowCreateGroup(true)}
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    {groups.length === 0 ? (
                      <div className="p-8 glass rounded-3xl border-dashed border-2 border-white/5 text-center">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No active groups</p>
                      </div>
                    ) : (
                      groups.map((g, i) => (
                        <button
                          key={g.id}
                          onClick={() => loadGroupDetails(g.id)}
                          className={`w-full text-left p-6 rounded-3xl transition-all group relative overflow-hidden ${
                            selectedGroupId === g.id ? 'glass bg-primary-500/10 border-primary-500/40' : 'glass-card border-white/5'
                          }`}
                        >
                          <h4 className="font-bold text-lg mb-1 group-hover:text-primary-400 transition-colors">{g.name}</h4>
                          <div className="flex justify-between items-center mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-1.5"><Users size={12} /> {g.members.length} Members</span>
                            <span className="text-primary-400">Ξ {g.totalExpenses}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8">
                  {selectedGroupId === null ? (
                    <div className="h-full min-h-[500px] glass rounded-[40px] flex flex-col items-center justify-center text-slate-500 border-dashed border-2 border-white/5 p-12 text-center">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-4xl shadow-inner border border-white/10">📂</div>
                      <h3 className="text-xl font-bold text-slate-300 mb-2 uppercase tracking-tighter">Initialize View</h3>
                      <p className="max-w-xs text-sm text-slate-500">Select a group ledger from the sidebar to visualize on-chain data.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Header Card */}
                      <div className="glass p-10 rounded-[40px] relative overflow-hidden border-white/10">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/15 blur-[100px] -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <h2 className="text-4xl font-black tracking-tight">{selectedGroup?.name}</h2>
                                 <div className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-500/20">Protocol Live</div>
                              </div>
                              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                 <Globe size={14} /> Registered {new Date((selectedGroup?.createdAt || 0) * 1000).toLocaleDateString()}
                              </p>
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn-primary py-3 px-8 text-sm font-black" 
                              onClick={() => {
                                setExpenseParticipants(selectedGroup?.members || []);
                                setShowAddExpense(true);
                              }}
                            >
                              <Plus size={18} /> New Expense
                            </motion.button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                              { label: 'Network Value', value: `Ξ ${selectedGroup?.totalExpenses}`, icon: <DollarSign size={14} /> },
                              { label: 'Ledger Count', value: selectedGroup?.expenseCount, icon: <History size={14} /> },
                              { label: 'Members', value: selectedGroup?.members.length, icon: <Users size={14} /> },
                              { label: 'Your Balance', value: balances.find(b => b.address.toLowerCase() === account.toLowerCase())?.amount || '0', isBalance: true },
                            ].map((stat, i) => (
                              <div key={i} className="glass bg-white/5 p-5 rounded-3xl border-white/5">
                                <p className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest flex items-center gap-1.5">{stat.icon} {stat.label}</p>
                                <p className={`text-xl font-black ${stat.isBalance ? (Number(stat.value) >= 0 ? 'text-green-400' : 'text-rose-400') : 'text-slate-200'}`}>
                                  {stat.isBalance && Number(stat.value) >= 0 ? '+' : ''}{stat.isBalance ? `Ξ ${stat.value}` : stat.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Main Data Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Settlements */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter ml-2">Active Debts</h4>
                          <div className="space-y-3">
                            {balances.map(b => {
                              const amt = Number(b.amount);
                              if (amt >= 0 || b.address.toLowerCase() === account.toLowerCase()) return null;
                              return (
                                <div key={b.address} className="glass-card p-5 rounded-[32px] flex justify-between items-center border-white/5">
                                  <div>
                                    <p className="font-bold text-[10px] text-slate-500 tracking-[0.2em]">{b.address.slice(0,6)}...{b.address.slice(-4)}</p>
                                    <p className="text-rose-400 text-lg font-black tracking-tight mt-1">Ξ {Math.abs(amt).toFixed(4)}</p>
                                  </div>
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-primary-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-primary-500/20 transition-all"
                                    onClick={() => settleDebt(b.address, Math.abs(amt).toString())}
                                  >
                                    Settle
                                  </motion.button>
                                </div>
                              );
                            })}
                            {balances.every(b => Number(b.amount) >= 0 || b.address.toLowerCase() === account.toLowerCase()) && (
                              <div className="py-12 glass bg-white/2 rounded-[32px] border-dashed border-2 border-white/5 flex flex-col items-center opacity-50">
                                <CheckCircle2 size={32} className="text-green-500 mb-3" />
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Protocol Settled</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Activity */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter ml-2">Ledger Feed</h4>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {expenses.map((e, i) => (
                              <div key={e.id} className="glass-card p-5 rounded-[32px] border-white/5">
                                <div className="flex justify-between items-start mb-3">
                                  <h5 className="font-black text-slate-200 tracking-tight text-sm">{e.description}</h5>
                                  <span className="text-primary-400 font-black text-xs">Ξ {e.amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                  <span>By {e.payer.slice(0,6)}...</span>
                                  <span>{new Date(e.timestamp * 1000).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS (UNCHANGED LOGIC, JUST RE-ANIMATED) */}
      <AnimatePresence>
        {showCreateGroup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowCreateGroup(false)}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass p-10 rounded-[40px] w-full max-w-md relative z-10 border-white/10 shadow-2xl">
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Initialize Group</h3>
              <form onSubmit={createGroup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Protocol Name</label>
                  <input type="text" className="w-full font-bold py-4 px-6" placeholder="e.g. Europe 2024" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Member Nodes (Addresses)</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all min-h-[120px] text-xs font-mono" placeholder="0x..., 0x..." value={newGroupMembers} onChange={(e) => setNewGroupMembers(e.target.value)} required />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" className="btn-secondary flex-1 font-black text-[10px] uppercase tracking-[0.2em]" onClick={() => setShowCreateGroup(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1 font-black text-[10px] uppercase tracking-[0.2em]" disabled={loading}>{loading ? 'Deploying...' : 'Confirm'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddExpense && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowAddExpense(false)}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass p-10 rounded-[40px] w-full max-w-md relative z-10 border-white/10 shadow-2xl">
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Log Expense</h3>
              <form onSubmit={addExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Asset Amount (ETH)</label>
                  <input type="number" step="0.0001" className="w-full text-2xl font-black py-4 px-6" placeholder="0.00" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Asset Desc</label>
                  <input type="text" className="w-full font-bold py-4 px-6" placeholder="e.g. Dinner" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Participant Nodes</label>
                  <div className="max-h-[160px] overflow-y-auto space-y-2 p-3 bg-white/2 rounded-[24px] border border-white/5 custom-scrollbar">
                    {selectedGroup?.members.map(member => (
                      <label key={member} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl cursor-pointer border border-transparent hover:border-white/5">
                        <input type="checkbox" className="w-5 h-5 rounded-lg border-white/20 bg-transparent text-primary-500" checked={expenseParticipants.includes(member)} onChange={(e) => e.target.checked ? setExpenseParticipants([...expenseParticipants, member]) : setExpenseParticipants(expenseParticipants.filter(m => m !== member))} />
                        <span className="text-[10px] font-black text-slate-400 tracking-tight">{member === account ? 'Self Node' : `${member.slice(0,6)}...${member.slice(-4)}`}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" className="btn-secondary flex-1 font-black text-[10px] uppercase tracking-[0.2em]" onClick={() => setShowAddExpense(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1 font-black text-[10px] uppercase tracking-[0.2em]" disabled={loading}>{loading ? 'Broadcasting...' : 'Confirm'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-20 h-20 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
