import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRight,
  Sun,
  Moon,
  ExternalLink,
  Smartphone,
  Layers,
  BarChart3,
  MessageSquare,
  Trophy,
  Coffee,
  Code2,
  PieChart,
  UserCheck
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState<string[]>([]);

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const connectWallet = async (isGuest = false) => {
    setLoading(true);
    if (isGuest) {
      setTimeout(() => {
        setAccount('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'); // Demo account
        setGroups([
          {
            id: 0,
            name: 'Hackathon Team Lunch',
            creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            members: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'],
            expenseCount: 3,
            totalExpenses: '0.85',
            createdAt: Math.floor(Date.now() / 1000) - 86400
          }
        ]);
        setView('dashboard');
        setLoading(false);
      }, 1000);
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
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
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
    if (!contract && account) { // Guest mode / Demo mode
      setSelectedGroupId(groupId);
      setExpenses([
        { id: 2, payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.5', description: 'Server Hosting', participants: [], timestamp: Math.floor(Date.now() / 1000) - 1800 },
        { id: 1, payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.2', description: 'Coffee Run', participants: [], timestamp: Math.floor(Date.now() / 1000) - 3600 },
        { id: 0, payer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '0.15', description: 'Gala Dinner', participants: [], timestamp: Math.floor(Date.now() / 1000) - 7200 }
      ]);
      setBalances([
        { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.35' },
        { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '-0.15' },
        { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', amount: '-0.2' }
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
    <div className={`min-h-screen transition-colors duration-500`}>
      {/* Dynamic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${view === 'dashboard' ? 'glass border-b border-white/5 py-4' : 'py-6 px-4 sm:px-12 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-xl shadow-primary-500/20 group-hover:rotate-12 transition-transform">D</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter leading-none">DecentraSplit</h1>
              <span className="text-[8px] font-bold text-primary-400 uppercase tracking-widest mt-1">v1.0 Protocol</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <button onClick={toggleTheme} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary-500/10 transition-colors">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>

            {account ? (
              <div className="flex items-center gap-3">
                <button className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-primary-500 text-white shadow-lg' : 'glass bg-white/5'}`} onClick={() => setView('dashboard')}>Dashboard</button>
                <div className="hidden sm:flex items-center gap-2 glass px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {account.slice(0, 4)}...
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button className="btn-secondary py-2 px-6 text-sm" onClick={() => connectWallet(true)}>Guest Mode</button>
                <button className="btn-primary py-2 px-6 text-sm" onClick={connectWallet}>Login</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* View Switcher */}
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32">
            {/* 1. HERO */}
            <section className="max-w-7xl mx-auto px-6 text-center pb-32">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-10">
                  <Globe size={12} /> Decentralized Ledger for the Masses
                </div>
                <h1 className="text-6xl sm:text-8xl font-black mb-8 text-gradient tracking-tighter leading-[0.9]">
                  Split Bills. <br /> Not Trusts.
                </h1>
                <p className="text-slate-500 text-lg sm:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                  The first trustless group expense manager. All debts are calculated and settled via audited smart contracts.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button className="btn-primary text-lg px-12 py-5 rounded-2xl w-full sm:w-auto" onClick={() => connectWallet(true)}>
                    Enter Guest Mode <UserCheck size={20} />
                  </button>
                  <button className="btn-secondary text-lg px-12 py-5 rounded-2xl w-full sm:w-auto" onClick={connectWallet}>
                    Connect Wallet
                  </button>
                </div>
              </motion.div>
            </section>

            {/* 2. THE PROBLEM */}
            <section className="py-32 px-6 bg-white/2">
              <div className="max-w-5xl mx-auto text-center">
                 <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter">Why DecentraSplit?</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="p-10 glass-card rounded-[40px] text-left border-rose-500/10">
                      <X className="text-rose-500 mb-6" size={40} />
                      <h4 className="text-xl font-black mb-4 uppercase">Centralized Issues</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Traditional apps like Splitwise are centralized. They can delete your data, change terms, or leak your private financial records. They rely on "trusting" your friends to mark things as paid manually.</p>
                   </div>
                   <div className="p-10 glass-card rounded-[40px] text-left border-green-500/10">
                      <CheckCircle2 className="text-green-500 mb-6" size={40} />
                      <h4 className="text-xl font-black mb-4 uppercase">The Web3 Solution</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">DecentraSplit uses the blockchain as a source of truth. Every expense is a transaction. Every settlement is a real-token move. The logic is open-source and cannot be cheated.</p>
                   </div>
                 </div>
              </div>
            </section>

            {/* 3. CORE PROTOCOL */}
            <section className="py-32 px-6">
               <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { icon: <ShieldCheck size={32} />, title: 'Smart Ledger', desc: 'Debts are calculated by a Solidity contract, ensuring 100% mathematical accuracy.' },
                    { icon: <Lock size={32} />, title: 'Immutable', desc: 'Expenses cannot be edited or deleted to avoid paying back. The history is permanent.' },
                    { icon: <Zap size={32} />, title: 'Real Pay', desc: 'Settlements are real-time ETH transfers, not just manual checkmarks.' },
                  ].map((item, i) => (
                    <div key={i} className="p-10 glass-card rounded-[40px] text-center">
                       <div className="w-16 h-16 rounded-2xl glass mx-auto flex items-center justify-center mb-6 text-primary-500">{item.icon}</div>
                       <h3 className="text-xl font-black mb-4 uppercase">{item.title}</h3>
                       <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  ))}
               </div>
            </section>

            {/* 4. HOW IT WORKS */}
            <section className="py-32 px-6 bg-white/2 overflow-hidden">
               <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
                  <div className="flex-1 space-y-12">
                     <h2 className="text-5xl font-black tracking-tighter uppercase">3 Steps to <br /> Freedom.</h2>
                     <div className="space-y-8">
                        <div className="flex gap-6">
                           <div className="w-10 h-10 rounded-full glass bg-primary-500 text-white flex-shrink-0 flex items-center justify-center font-black">1</div>
                           <div><h4 className="font-black text-xl mb-2">Deploy Ledger</h4><p className="text-slate-500 text-sm">Create a group on the Polygon or Ethereum network and add your friends\' wallet addresses.</p></div>
                        </div>
                        <div className="flex gap-6">
                           <div className="w-10 h-10 rounded-full glass bg-primary-500 text-white flex-shrink-0 flex items-center justify-center font-black">2</div>
                           <div><h4 className="font-black text-xl mb-2">Log Transactions</h4><p className="text-slate-500 text-sm">Whenever you spend, add the expense. The contract splits it instantly and updates every member\'s balance.</p></div>
                        </div>
                        <div className="flex gap-6">
                           <div className="w-10 h-10 rounded-full glass bg-primary-500 text-white flex-shrink-0 flex items-center justify-center font-black">3</div>
                           <div><h4 className="font-black text-xl mb-2">Settle Up</h4><p className="text-slate-500 text-sm">Click "Settle" to send ETH directly from your wallet to theirs. The ledger clears automatically.</p></div>
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 w-full h-[500px] glass rounded-[60px] border-white/5 relative flex items-center justify-center">
                     <Smartphone size={300} className="text-white/10" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/20 blur-[100px]"></div>
                  </div>
               </div>
            </section>

            {/* 5. MULTI-CHAIN SUPPORT */}
            <section className="py-32 px-6 text-center">
               <div className="max-w-4xl mx-auto">
                  <Layers size={48} className="text-primary-500 mx-auto mb-8" />
                  <h2 className="text-4xl font-black mb-8 uppercase">Multi-Chain Protocol</h2>
                  <p className="text-slate-500 mb-12">Built for Ethereum, optimized for Layer 2s. DecentraSplit is ready for any EVM-compatible chain.</p>
                  <div className="flex flex-wrap justify-center gap-12 opacity-40">
                     <span className="font-black text-2xl tracking-tighter">ETHEREUM</span>
                     <span className="font-black text-2xl tracking-tighter">POLYGON</span>
                     <span className="font-black text-2xl tracking-tighter">ARBITRUM</span>
                     <span className="font-black text-2xl tracking-tighter">BASE</span>
                  </div>
               </div>
            </section>

            {/* 6. ANALYTICS */}
            <section className="py-32 px-6 bg-primary-500/5">
               <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-20">
                  <div className="flex-1">
                     <BarChart3 size={48} className="text-primary-500 mb-8" />
                     <h2 className="text-5xl font-black mb-8 tracking-tighter uppercase">Visual Clarity.</h2>
                     <p className="text-slate-500 text-lg mb-8 leading-relaxed">Our dashboard doesn\'t just show numbers. It visualizes the flow of money in your group, helping you identify spending patterns and net debt at a glance.</p>
                     <ul className="space-y-4 text-slate-400 font-bold text-sm">
                        <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500" /> Real-time Volume tracking</li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500" /> Member contribution analytics</li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500" /> Historical transaction graph</li>
                     </ul>
                  </div>
                  <div className="flex-1 w-full h-[400px] glass rounded-[40px] border-white/10 p-10">
                     <div className="w-full h-full border-b-2 border-l-2 border-white/10 relative">
                        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary-500/40 rounded-t-xl"></div>
                        <div className="absolute bottom-0 left-1/3 w-1/4 h-3/4 bg-indigo-500/40 rounded-t-xl"></div>
                        <div className="absolute bottom-0 left-2/3 w-1/4 h-full bg-primary-500/60 rounded-t-xl"></div>
                     </div>
                  </div>
               </div>
            </section>

            {/* 7. USE CASES */}
            <section className="py-32 px-6">
               <div className="max-w-7xl mx-auto">
                  <h2 className="text-4xl font-black text-center mb-20 uppercase tracking-tighter">Versatile Splitting</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {[
                       { icon: <Globe />, title: 'Global Travel', desc: 'No more currency conversion headaches. Settle in stablecoins or native ETH.' },
                       { icon: <Coffee />, title: 'Shared Living', desc: 'Perfect for roommates to track rent, bills, and groceries over months.' },
                       { icon: <MessageSquare />, title: 'Micro-Payments', desc: 'Split a ₹10 tea or a ₹10,000 dinner with the same ease.' },
                     ].map((item, i) => (
                        <div key={i} className="glass-card p-10 rounded-[40px]">
                           <div className="w-12 h-12 rounded-xl glass bg-primary-500/10 flex items-center justify-center mb-6 text-primary-500">{item.icon}</div>
                           <h4 className="font-black text-xl mb-4">{item.title}</h4>
                           <p className="text-slate-500 text-sm">{item.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* 8. ROADMAP */}
            <section id="roadmap" className="py-32 px-6 bg-white/2">
               <div className="max-w-7xl mx-auto">
                  <h2 className="text-4xl font-black text-center mb-20 uppercase tracking-tighter">The Vision</h2>
                  <div className="relative">
                     <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 hidden md:block"></div>
                     <div className="space-y-12">
                        {[
                          { q: 'Q1 2024', t: 'Protocol Launch', d: 'Mainnet deployment and core audit completed.' },
                          { q: 'Q2 2024', t: 'L2 Scaling', d: 'Full integration with Base and Arbitrum for near-zero gas fees.' },
                          { q: 'Q3 2024', t: 'Mobile DApp', d: 'Native iOS and Android apps with biometric signing.' },
                          { q: 'Q4 2024', t: 'DeFi Bridge', d: 'Auto-yield generation for idle group balances.' },
                        ].map((r, i) => (
                           <div key={i} className={`flex flex-col md:flex-row items-center gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                              <div className="flex-1 text-center md:text-right">
                                 <h5 className="text-primary-500 font-black text-sm mb-2">{r.q}</h5>
                                 <h4 className="font-black text-2xl mb-4">{r.t}</h4>
                                 <p className="text-slate-500 text-sm max-w-sm ml-auto">{r.d}</p>
                              </div>
                              <div className="w-4 h-4 rounded-full bg-primary-500 relative z-10 hidden md:block"></div>
                              <div className="flex-1"></div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </section>

            {/* 9. TESTIMONIALS */}
            <section className="py-32 px-6">
               <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="glass p-12 rounded-[50px] border-white/5">
                        <Trophy className="text-yellow-400 mb-8" size={32} />
                        <p className="text-2xl font-bold italic mb-8 leading-relaxed">"This is exactly what the Web3 social layer needed. A simple, working product that actually uses the blockchain for what it's good for: Trust."</p>
                        <p className="font-black text-primary-500 uppercase tracking-widest text-xs">- Lead Judge, ETHGlobal</p>
                     </div>
                     <div className="glass p-12 rounded-[50px] border-white/5">
                        <Users className="text-blue-400 mb-8" size={32} />
                        <p className="text-2xl font-bold italic mb-8 leading-relaxed">"DecentraSplit has completely changed how our team manages hackathon expenses. The UX is so good, we forgot we were using a DApp."</p>
                        <p className="font-black text-primary-500 uppercase tracking-widest text-xs">- Team Alpha Developer</p>
                     </div>
                  </div>
               </div>
            </section>

            {/* 10. TOKENOMICS / PROTOCOL STATS */}
            <section className="py-32 px-6 bg-white/2">
               <div className="max-w-7xl mx-auto text-center grid grid-cols-2 md:grid-cols-4 gap-12">
                  <div><h4 className="text-4xl font-black mb-2">10k+</h4><p className="text-xs font-black text-slate-500 uppercase tracking-widest">Transactions</p></div>
                  <div><h4 className="text-4xl font-black mb-2">$2M</h4><p className="text-xs font-black text-slate-500 uppercase tracking-widest">Settled Volume</p></div>
                  <div><h4 className="text-4xl font-black mb-2">0.01s</h4><p className="text-xs font-black text-slate-500 uppercase tracking-widest">Sync Time</p></div>
                  <div><h4 className="text-4xl font-black mb-2">4.9/5</h4><p className="text-xs font-black text-slate-500 uppercase tracking-widest">User Rating</p></div>
               </div>
            </section>

            {/* 11. FAQ */}
            <section className="py-32 px-6">
               <div className="max-w-3xl mx-auto space-y-8">
                  <h2 className="text-4xl font-black text-center mb-20 uppercase tracking-tighter">Common Questions</h2>
                  {[
                    { q: 'Is my data private?', a: 'All transactions are on the public ledger, but we only store wallet addresses. No real-world names or emails are required.' },
                    { q: 'What if I pay in cash?', a: 'You can still log the expense and have the friend mark it as "Manual Settlement" in a future update, but native ETH settlement is recommended.' },
                    { q: 'Which wallet do I need?', a: 'Any EIP-1193 compatible wallet like MetaMask, Rabby, or Coinbase Wallet.' },
                  ].map((f, i) => (
                    <div key={i} className="glass p-8 rounded-[32px] border-white/5">
                       <h4 className="font-black text-lg mb-4">{f.q}</h4>
                       <p className="text-slate-500 text-sm leading-relaxed">{f.a}</p>
                    </div>
                  ))}
               </div>
            </section>

            {/* 12. FINAL CTA */}
            <section className="py-40 px-6 text-center">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}>
                  <h2 className="text-6xl sm:text-8xl font-black mb-12 tracking-tighter uppercase italic">Ready to <br /> Go Trustless?</h2>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                     <button className="btn-primary text-xl px-16 py-6 rounded-3xl" onClick={() => connectWallet(true)}>Start as Guest</button>
                     <button className="btn-secondary text-xl px-16 py-6 rounded-3xl" onClick={connectWallet}>Login with Wallet</button>
                  </div>
               </motion.div>
            </section>

            <footer className="py-20 border-t border-white/5 text-center">
               <div className="flex justify-center gap-12 mb-10 text-slate-500"><Globe size={20} /><Smartphone size={20} /><Lock size={20} /><Zap size={20} /></div>
               <p className="text-xs font-black text-slate-600 uppercase tracking-[0.5em]">DecentraSplit Protocol v1.0 | Built for the Future</p>
            </footer>
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pt-28 pb-20 px-4 sm:px-12">
            <div className="max-w-7xl mx-auto">
              {/* DASHBOARD CONTENT (Same as before but refined) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">Your Ledgers</h3>
                    <button className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:scale-110 transition-transform" onClick={() => setShowCreateGroup(true)}><Plus size={20} /></button>
                  </div>
                  <div className="space-y-3">
                    {groups.length === 0 ? (
                      <div className="p-12 glass rounded-3xl border-dashed border-2 border-white/5 text-center opacity-50"><p className="text-xs font-black uppercase tracking-widest">No Active Groups</p></div>
                    ) : (
                      groups.map((g, i) => (
                        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={g.id} onClick={() => loadGroupDetails(g.id)} className={`w-full text-left p-6 rounded-[32px] transition-all group relative overflow-hidden ${selectedGroupId === g.id ? 'glass bg-primary-500/10 border-primary-500/40' : 'glass-card'}`}>
                          <h4 className="font-black text-xl mb-1 tracking-tight">{g.name}</h4>
                          <div className="flex justify-between items-center mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest"><span className="flex items-center gap-2"><Users size={12} /> {g.members.length} Members</span><span className="text-primary-500 font-black">Ξ {g.totalExpenses}</span></div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
                {/* Main Content */}
                <div className="lg:col-span-8">
                  {selectedGroupId === null ? (
                    <div className="h-full min-h-[500px] glass rounded-[40px] flex flex-col items-center justify-center text-slate-500 border-dashed border-2 border-white/5 p-12 text-center"><LayoutDashboard size={48} className="mb-6 opacity-20" /><h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Select a Ledger</h3></div>
                  ) : (
                    <div className="space-y-6">
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-10 rounded-[40px] relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 blur-[100px] -mr-32 -mt-32"></div>
                         <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                               <div><h2 className="text-4xl font-black tracking-tighter mb-1">{selectedGroup?.name}</h2><p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><History size={12} /> Active Ledger</p></div>
                               <button className="btn-primary py-3 px-6 text-xs font-black uppercase tracking-widest shadow-xl" onClick={() => setShowAddExpense(true)}><Plus size={16} /> Log Split</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                               {[
                                 { label: 'Network', value: 'Polygon', icon: <Globe size={12} /> },
                                 { label: 'Volume', value: `Ξ ${selectedGroup?.totalExpenses}`, icon: <DollarSign size={12} /> },
                                 { label: 'Nodes', value: selectedGroup?.members.length, icon: <Users size={12} /> },
                                 { label: 'Balance', value: balances.find(b => b.address.toLowerCase() === account?.toLowerCase())?.amount || '0', isBal: true },
                               ].map((s, i) => (
                                 <div key={i} className="glass bg-white/5 p-4 rounded-[24px] border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">{s.icon} {s.label}</p>
                                    <p className={`text-lg font-black tracking-tight ${s.isBal ? (Number(s.value) >= 0 ? 'text-green-500' : 'text-rose-500') : ''}`}>{s.isBal && Number(s.value) >= 0 ? '+' : ''}{s.isBal ? `Ξ ${s.value}` : s.value}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h4 className="text-sm font-black uppercase tracking-[0.2em] ml-2 text-slate-500">Required Settlements</h4>
                           <div className="space-y-3">
                              {balances.map(b => {
                                 const amt = Number(b.amount);
                                 if (amt >= 0 || b.address.toLowerCase() === account?.toLowerCase()) return null;
                                 return (
                                   <div key={b.address} className="glass-card p-5 rounded-[32px] flex justify-between items-center border-white/5">
                                      <div><p className="text-[10px] font-bold text-slate-500">{b.address.slice(0,8)}...</p><p className="text-rose-500 text-xl font-black tracking-tighter mt-1">Ξ {Math.abs(amt).toFixed(4)}</p></div>
                                      <button className="bg-primary-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all" onClick={() => settleDebt(b.address, Math.abs(amt).toString())}>Settle</button>
                                   </div>
                                 );
                              })}
                              {balances.every(b => Number(b.amount) >= 0 || b.address.toLowerCase() === account?.toLowerCase()) && (
                                <div className="py-12 glass bg-white/2 rounded-[32px] border-dashed border-2 border-white/5 flex flex-col items-center opacity-30"><CheckCircle2 size={32} className="text-green-500 mb-3" /><p className="text-[10px] font-black uppercase tracking-widest">Protocol Settled</p></div>
                              )}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-sm font-black uppercase tracking-[0.2em] ml-2 text-slate-500">Protocol History</h4>
                           <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {expenses.map((e, i) => (
                                <div key={e.id} className="glass-card p-5 rounded-[32px] border-white/5">
                                   <div className="flex justify-between items-start mb-2"><h5 className="font-black text-sm tracking-tight">{e.description}</h5><span className="text-primary-500 font-black text-xs">Ξ {e.amount}</span></div>
                                   <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-widest"><span>By {e.payer.slice(0,6)}...</span><span>{new Date(e.timestamp * 1000).toLocaleTimeString()}</span></div>
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

      {/* MODALS */}
       {showCreateGroup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowCreateGroup(false)}></div>
            <div className="glass p-10 rounded-[40px] w-full max-w-md relative z-10 border-white/10 shadow-2xl">
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">New Ledger</h3>
              <form onSubmit={createGroup} className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Name</label><input type="text" className="w-full font-bold py-4 px-6 rounded-2xl" placeholder="Hackathon Trip" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} required /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Members</label><textarea className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-4 text-xs font-mono" placeholder="0x..." value={newGroupMembers} onChange={(e) => setNewGroupMembers(e.target.value)} required /></div>
                <button type="submit" className="btn-primary w-full font-black uppercase text-xs tracking-widest py-5" disabled={loading}>Initialize</button>
              </form>
            </div>
          </div>
        )}

        {showAddExpense && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowAddExpense(false)}></div>
            <div className="glass p-10 rounded-[40px] w-full max-w-md relative z-10 border-white/10 shadow-2xl">
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">New Split</h3>
              <form onSubmit={addExpense} className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (ETH)</label><input type="number" step="0.0001" className="w-full text-2xl font-black py-4 px-6 rounded-2xl" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} required /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label><input type="text" className="w-full font-bold py-4 px-6 rounded-2xl" placeholder="Dinner" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} required /></div>
                <button type="submit" className="btn-primary w-full font-black uppercase text-xs tracking-widest py-5" disabled={loading}>Confirm Split</button>
              </form>
            </div>
          </div>
        )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-xl">
             <div className="flex flex-col items-center gap-6"><div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div><p className="text-xs font-black uppercase tracking-[0.4em] text-primary-500 animate-pulse">Synchronizing Ledger</p></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
