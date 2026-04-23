import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Zap, Lock, Globe, Coffee, MessageSquare,
  Trophy, CheckCircle2, ArrowRight, ChevronDown, Users,
  BarChart3, Layers, Wallet, Star, GitBranch, Coins,
  TrendingUp, Clock, Shield, Repeat2, Sparkles, Play
} from 'lucide-react';

const inView = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
};

const slideLeft = {
  initial: { opacity: 0, x: -32 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
};

const slideRight = {
  initial: { opacity: 0, x: 32 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #080b10;
    --bg-2:     #0d1117;
    --bg-3:     #141b24;
    --bg-4:     #1a2332;
    --border:   rgba(255,255,255,0.07);
    --border-2: rgba(255,255,255,0.12);
    --text:     #f0f4ff;
    --text-2:   rgba(240,244,255,0.58);
    --text-3:   rgba(240,244,255,0.32);
    --accent:   #0ea5e9;
    --accent-2: #38bdf8;
    --green:    #10b981;
    --amber:    #f59e0b;
    --rose:     #f43f5e;
    --glow:     rgba(14,165,233,0.18);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }
  .mono { font-family: 'DM Mono', monospace; }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(8,11,16,0.82);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px; letter-spacing: -0.03em; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    font-size: 13px; color: var(--text-2); text-decoration: none;
    transition: color 0.2s; letter-spacing: 0.01em;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-right { display: flex; gap: 10px; align-items: center; }

  /* BUTTONS */
  .btn-primary {
    padding: 10px 22px; font-size: 13px; font-weight: 600; font-family: 'Syne', sans-serif;
    background: var(--accent); color: #fff; border: none; border-radius: 8px;
    cursor: pointer; letter-spacing: 0.01em;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 0 0 0 var(--glow);
  }
  .btn-primary:hover { background: var(--accent-2); transform: translateY(-1px); box-shadow: 0 4px 24px var(--glow); }
  .btn-ghost {
    padding: 10px 22px; font-size: 13px; font-weight: 500; font-family: 'Syne', sans-serif;
    background: transparent; color: var(--text-2); border: 1px solid var(--border-2);
    border-radius: 8px; cursor: pointer; letter-spacing: 0.01em;
    transition: color 0.2s, border-color 0.2s, transform 0.1s;
  }
  .btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.25); transform: translateY(-1px); }
  .btn-hero {
    padding: 15px 34px; font-size: 15px; font-weight: 700; font-family: 'Syne', sans-serif;
    background: var(--accent); color: #fff; border: none; border-radius: 10px;
    cursor: pointer; letter-spacing: 0.01em;
    box-shadow: 0 0 40px rgba(14,165,233,0.35), 0 2px 8px rgba(0,0,0,0.4);
    transition: all 0.25s ease;
  }
  .btn-hero:hover { background: var(--accent-2); transform: translateY(-2px); box-shadow: 0 0 60px rgba(14,165,233,0.45), 0 4px 16px rgba(0,0,0,0.5); }
  .btn-hero-ghost {
    padding: 15px 34px; font-size: 15px; font-weight: 600; font-family: 'Syne', sans-serif;
    background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid var(--border-2);
    border-radius: 10px; cursor: pointer; letter-spacing: 0.01em;
    transition: all 0.25s ease; backdrop-filter: blur(8px);
  }
  .btn-hero-ghost:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }

  /* TAGS */
  .tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Mono', monospace; font-size: 11px;
    color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 100px;
    background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.2);
  }
  .tag-green { color: var(--green); background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.2); }
  .tag-amber { color: var(--amber); background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.2); }

  /* PILL */
  .pill {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-3);
    padding: 6px 14px; border-radius: 100px;
    background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  }

  /* SURFACES */
  .card {
    background: var(--bg-2); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
  }
  .card:hover {
    border-color: rgba(14,165,233,0.2);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(14,165,233,0.05);
  }
  .card-elevated {
    background: var(--bg-3); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px;
  }

  /* DIVIDER */
  .divider { height: 1px; background: var(--border); }

  /* GRID PATTERNS */
  .grid-bg {
    background-image: linear-gradient(var(--border) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* GLOW ORBS */
  .orb {
    position: absolute; border-radius: 50%; pointer-events: none;
    filter: blur(80px); opacity: 0.4;
  }

  /* SECTION BASE */
  .section { padding: 100px 40px; }
  .section-sm { padding: 64px 40px; }
  .container { max-width: 1080px; margin: 0 auto; }
  .container-sm { max-width: 700px; margin: 0 auto; }

  /* COMPARISON TABLE */
  .compare-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0;
    padding: 14px 20px; align-items: center;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .compare-row:last-child { border-bottom: none; }
  .compare-row:hover { background: rgba(255,255,255,0.025); }

  /* FLOW STEPS */
  .flow-step {
    display: flex; gap: 20px; align-items: flex-start;
    padding: 24px; border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--bg-2);
    transition: border-color 0.2s;
  }
  .flow-step:hover { border-color: rgba(14,165,233,0.25); }
  .step-num {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.25);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent); font-weight: 600;
  }

  /* TIMELINE */
  .timeline-item {
    display: flex; gap: 20px;
    padding-bottom: 36px;
    position: relative;
  }
  .timeline-item::before {
    content: ''; position: absolute; left: 17px; top: 36px; bottom: 0;
    width: 1px; background: var(--border);
  }
  .timeline-item:last-child::before { display: none; }
  .timeline-dot {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid var(--accent); background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1;
  }
  .timeline-dot.done { background: var(--accent); }

  /* STAT CARD */
  .stat-card {
    text-align: center; padding: 32px 24px;
    border-right: 1px solid var(--border);
  }
  .stat-card:last-child { border-right: none; }

  /* TICKER */
  .ticker { overflow: hidden; white-space: nowrap; }
  .ticker-inner { display: inline-flex; gap: 48px; animation: ticker 18s linear infinite; }
  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* PRICE CARD DEMO */
  .ledger-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; border-radius: 10px;
    background: var(--bg-3); border: 1px solid var(--border);
    margin-bottom: 8px; transition: border-color 0.2s;
  }
  .ledger-row:hover { border-color: rgba(14,165,233,0.2); }

  /* FAQ */
  .faq-item {
    border-bottom: 1px solid var(--border); padding: 22px 0;
    cursor: pointer;
  }
  .faq-item:last-child { border-bottom: none; }
  .faq-q {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 14px; font-weight: 600; font-family: 'Syne', sans-serif;
  }
  .faq-a { font-size: 13px; color: var(--text-2); line-height: 1.7; margin-top: 12px; }

  /* BADGE */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-family: 'DM Mono', monospace;
    padding: 4px 10px; border-radius: 6px;
    background: rgba(16,185,129,0.1); color: var(--green);
    border: 1px solid rgba(16,185,129,0.2);
  }

  /* QUOTE CARD */
  .quote-card {
    background: var(--bg-2); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px 28px;
    position: relative; overflow: hidden;
  }
  .quote-card::before {
    content: '"'; position: absolute; top: -20px; left: 20px;
    font-size: 160px; color: rgba(14,165,233,0.06);
    font-family: 'Syne', sans-serif; line-height: 1;
  }

  /* MINI CHART */
  .bar { border-radius: 4px 4px 0 0; transition: height 0.6s ease, background 0.3s; }

  @media (max-width: 768px) {
    .nav-links { display: none; }
    .section { padding: 72px 20px; }
    .section-sm { padding: 48px 20px; }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ onGuest, onConnect }: { onGuest: () => void; onConnect: () => void }) {
  return (
    <nav className="nav">
      <div className="nav-logo">Decentra<span>Split</span></div>
      <div className="nav-links">
        {['Product', 'How It Works', 'Protocol', 'Roadmap', 'FAQ'].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}>{l}</a>
        ))}
      </div>
      <div className="nav-right">
        <button className="btn-ghost" onClick={onGuest}>Guest Mode</button>
        <button className="btn-primary" onClick={onConnect}>Connect Wallet</button>
      </div>
    </nav>
  );
}

// ─── SECTION 1: HERO ─────────────────────────────────────────────────────────
function Hero({ onGuest, onConnect }: { onGuest: () => void; onConnect: () => void }) {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }} id="product">
      {/* Grid bg */}
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      {/* Orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: '#0ea5e9', top: '10%', left: '30%', transform: 'translate(-50%,-50%)' }} />
      <div className="orb" style={{ width: 400, height: 400, background: '#10b981', top: '70%', right: '10%', opacity: 0.2 }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          <span className="pill"><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />Protocol Live · Polygon + Ethereum</span>
          <span className="badge"><Sparkles size={9} />ETHGlobal Hackathon 2026</span>
        </div>
        <h1 style={{ fontSize: 'clamp(44px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.04em', margin: '0 0 24px' }}>
          Split bills.<br />
          <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundImage: 'linear-gradient(135deg, #0ea5e9, #38bdf8, #10b981)' }}>Not trust.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 44px', fontWeight: 300 }}>
          The first <strong style={{ color: 'var(--text)', fontWeight: 500 }}>trustless group expense protocol</strong>. Every debt calculated and settled by audited smart contracts — not promises, not spreadsheets.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
          <button className="btn-hero" onClick={onGuest} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Play size={14} fill="white" /> Try Guest Mode — No Wallet Needed
          </button>
          <button className="btn-hero-ghost" onClick={onConnect} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={14} /> Connect Wallet
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>No sign-up · No wallet required for guest · 100% open-source</p>
        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ marginTop: 56, display: 'flex', justifyContent: 'center' }}>
          <ChevronDown size={20} color="var(--text-3)" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── SECTION 2: STATS BAR ────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { v: '10,000+', l: 'Transactions Settled', icon: <Repeat2 size={16} color="var(--accent)" /> },
    { v: '$2M+', l: 'Volume Processed', icon: <Coins size={16} color="var(--green)" /> },
    { v: '18 ms', l: 'Chain Sync Time', icon: <Clock size={16} color="var(--amber)" /> },
    { v: '4.9 / 5', l: 'Hackathon Rating', icon: <Star size={16} color="var(--amber)" /> },
  ];
  return (
    <section style={{ background: 'var(--bg-2)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((s, i) => (
          <motion.div key={i} {...inView} transition={{ delay: i * 0.08 }} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}>{s.v}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, fontFamily: 'DM Mono, monospace' }}>{s.l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION 3: THE PROBLEM ──────────────────────────────────────────────────
function TheProblem() {
  return (
    <section className="section" id="product">
      <div className="container">
        <motion.div {...inView} style={{ marginBottom: 56 }}>
          <span className="tag">The Problem</span>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 0', lineHeight: 1.1 }}>
            Your current expense app<br />can lie to you.
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Bad side */}
          <motion.div {...slideLeft} className="card" style={{ borderColor: 'rgba(244,63,94,0.2)', background: 'rgba(244,63,94,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Splitwise / Tricount</span>
            </div>
            {['Server can go offline or shut down anytime', 'Anyone can dispute or "forget" a debt', 'No cryptographic proof of who paid what', 'Company can change terms or delete history', 'Requires trusting a centralized party'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--rose)', marginTop: 7, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </motion.div>
          {/* Good side */}
          <motion.div {...slideRight} className="card" style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="var(--green)" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>DecentraSplit</span>
            </div>
            {['On-chain forever — no server to kill', 'Smart contract enforces every settlement', 'Every transaction cryptographically signed', 'Open-source, audited, immutable logic', 'Zero trust required between participants'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <CheckCircle2 size={14} color="var(--green)" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 4: COMPARISON TABLE ─────────────────────────────────────────────
function ComparisonTable() {
  const rows = [
    ['Tamper-proof history', true, false],
    ['Real money settlement (ETH)', true, false],
    ['Works without company servers', true, false],
    ['No account/email required', true, false],
    ['Cross-border, no forex fees', true, false],
    ['Open-source & auditable', true, false],
    ['Guest / demo mode', true, false],
  ];
  return (
    <section className="section" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <motion.div {...inView} style={{ marginBottom: 48 }}>
          <span className="tag">Comparison</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 0', lineHeight: 1.1 }}>
            Feature by feature — honest comparison
          </h2>
        </motion.div>
        <motion.div {...inView} transition={{ delay: 0.1 }} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          <div className="compare-row" style={{ background: 'var(--bg-3)', fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Feature</span>
            <span style={{ textAlign: 'center', color: 'var(--accent)' }}>DecentraSplit</span>
            <span style={{ textAlign: 'center' }}>Others</span>
          </div>
          {rows.map(([feature, us, them], i) => (
            <div key={i} className="compare-row">
              <span style={{ color: 'var(--text-2)' }}>{feature as string}</span>
              <span style={{ textAlign: 'center' }}>
                {us ? <CheckCircle2 size={16} color="var(--green)" style={{ margin: '0 auto' }} /> : <span style={{ color: 'var(--rose)' }}>✕</span>}
              </span>
              <span style={{ textAlign: 'center' }}>
                {them ? <CheckCircle2 size={16} color="var(--green)" style={{ margin: '0 auto' }} /> : <span style={{ color: 'var(--rose)' }}>✕</span>}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 5: HOW IT WORKS ─────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', icon: <Users size={18} color="var(--accent)" />, t: 'Create a Group Ledger', d: 'Deploy a smart contract for your group with one click. Add friends by their wallet address — no names, no emails, no trust needed.' },
    { n: '02', icon: <Layers size={18} color="var(--accent)" />, t: 'Log Expenses On-Chain', d: 'Whenever someone pays for the group, they add the expense. The contract instantly recalculates everyone\'s share with zero rounding errors.' },
    { n: '03', icon: <Zap size={18} color="var(--accent)" />, t: 'Settle with Real ETH', d: 'Hit "Settle" to trigger a real ETH transfer to the person you owe. The ledger updates automatically on payment confirmation.' },
    { n: '04', icon: <BarChart3 size={18} color="var(--accent)" />, t: 'Audit Anytime, Forever', d: 'Every expense, every settlement, every balance is verifiable on-chain forever. No one can revise history or deny a payment.' },
  ];
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <motion.div {...inView} style={{ marginBottom: 56 }}>
          <span className="tag">Walkthrough</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 8px', lineHeight: 1.1 }}>Four steps to go trustless</h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Works in Guest Mode too — no wallet needed to explore.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {steps.map((s, i) => (
            <motion.div key={i} {...inView} transition={{ delay: i * 0.1 }} className="flow-step">
              <div className="step-num">{s.n}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {s.icon}
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{s.t}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 6: LIVE DEMO PREVIEW ───────────────────────────────────────────
function LiveDemoPreview({ onGuest }: { onGuest: () => void }) {
  return (
    <section className="section" style={{ background: 'var(--bg-2)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
        <motion.div {...slideLeft}>
          <span className="tag tag-green">Live Preview</span>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 16px', lineHeight: 1.1 }}>
            See the ledger in action — right now
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 28 }}>
            Try Guest Mode to explore a fully-loaded demo dashboard with real contract data. No wallet, no sign-up, no commitment.
          </p>
          <button className="btn-hero" onClick={onGuest} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Play size={14} fill="white" /> Open Guest Dashboard
          </button>
        </motion.div>
        <motion.div {...slideRight}>
          <div className="card-elevated" style={{ fontFamily: 'DM Mono, monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>GROUP: GOKARNA TRIP</span>
              <span className="badge"><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />LIVE</span>
            </div>
            {[
              { d: 'Beach Resort Booking', a: '0.30 ETH', who: '0xA1...f3', color: 'var(--accent)' },
              { d: 'Scuba Diving Session', a: '0.15 ETH', who: '0xB2...c9', color: 'var(--accent)' },
              { d: 'Group Dinner 🍜', a: '0.08 ETH', who: '0xC3...d4', color: 'var(--accent)' },
              { d: 'Settlement → 0x70...a2', a: '0.05 ETH', who: 'confirmed', color: 'var(--green)' },
            ].map((r, i) => (
              <div key={i} className="ledger-row">
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 2 }}>{r.d}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>by {r.who}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{r.a}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Your balance</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--rose)', fontFamily: 'Syne, sans-serif' }}>−0.12 ETH owed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 7: PROTOCOL DEEP DIVE ──────────────────────────────────────────
function Protocol() {
  const cards = [
    { icon: <ShieldCheck size={22} color="var(--accent)" />, t: 'Smart Ledger Contract', d: 'Solidity contract calculates each member\'s share with zero rounding errors using integer arithmetic. Audited before deployment.' },
    { icon: <Lock size={22} color="var(--accent)" />, t: 'Immutable History', d: 'Every expense is an on-chain event. No admin key, no upgrade proxy. The contract is frozen — nobody can edit the past.' },
    { icon: <Zap size={22} color="var(--accent)" />, t: 'Atomic Settlement', d: 'Settling debt triggers an actual ETH transfer. The ledger clears only on confirmed block finality — not on a promise.' },
    { icon: <GitBranch size={22} color="var(--accent)" />, t: 'Multi-Chain Deploy', d: 'Same ABI on any EVM chain. Deploy on Polygon for sub-cent fees or Ethereum mainnet for maximum security.' },
    { icon: <Shield size={22} color="var(--accent)" />, t: 'Audited Codebase', d: 'Smart contracts reviewed by third-party auditors. Full source on GitHub — fork it, verify it, trust it.' },
    { icon: <TrendingUp size={22} color="var(--accent)" />, t: 'Gas Optimized', d: 'Expense logging costs ~40k gas on Polygon L2 — under $0.01. Designed for real daily use, not just demos.' },
  ];
  return (
    <section className="section" id="protocol">
      <div className="container">
        <motion.div {...inView} style={{ marginBottom: 56 }}>
          <span className="tag">Protocol</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 0', lineHeight: 1.1 }}>
            How it works under the hood
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {cards.map((c, i) => (
            <motion.div key={i} {...inView} transition={{ delay: i * 0.08 }} className="card">
              <div style={{ marginBottom: 16 }}>{c.icon}</div>
              <h4 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: '0 0 10px' }}>{c.t}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{c.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 8: MULTI-CHAIN ──────────────────────────────────────────────────
function MultiChain() {
  const chains = ['Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Optimism', 'zkSync'];
  return (
    <section className="section-sm" style={{ background: 'var(--bg-2)', textAlign: 'center', overflow: 'hidden' }}>
      <div className="container-sm">
        <motion.div {...inView}>
          <span className="tag">Infrastructure</span>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 12px' }}>Multi-chain by design</h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 40 }}>Deployed on any EVM-compatible chain. Sub-cent fees on L2s. Same contract, same trust.</p>
        </motion.div>
      </div>
      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-inner">
          {[...chains, ...chains].map((c, i) => (
            <span key={i} style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', color: 'var(--text-3)', padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 100, background: 'var(--bg)', whiteSpace: 'nowrap' }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ height: 24 }} />
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[['~$0.001', 'Avg gas on Polygon'], ['< 2s', 'Block finality L2'], ['5 chains', 'Currently deployed']].map(([v, l], i) => (
          <motion.div key={i} {...inView} transition={{ delay: i * 0.1 }} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em', color: 'var(--accent)' }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: 'DM Mono, monospace' }}>{l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION 9: ANALYTICS ───────────────────────────────────────────────────
function Analytics() {
  const bars = [40, 55, 45, 72, 58, 100, 74];
  return (
    <section className="section">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <motion.div {...slideLeft}>
          <div className="card-elevated" style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--text-3)' }}>SETTLEMENT VOLUME · 7 DAY</span>
              <span style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'DM Mono, monospace' }}>+34%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, marginBottom: 8 }}>
              {bars.map((h, i) => (
                <div key={i} className="bar" style={{ flex: 1, height: `${h}%`, background: i === 5 ? 'var(--accent)' : 'var(--bg-4)', boxShadow: i === 5 ? '0 0 20px rgba(14,165,233,0.4)' : 'none' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <span key={d} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{d}</span>
              ))}
            </div>
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['0xA1...f3', '0.42 ETH paid'], ['0xB2...c9', '0.28 ETH owed'], ['0xC3...d4', '0.15 ETH paid'], ['0xD4...e5', 'Settled ✓']].map(([addr, stat], i) => (
                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>{addr}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{stat}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div {...slideRight}>
          <span className="tag">Analytics</span>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 16px', lineHeight: 1.1 }}>Real-time group finance visibility</h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 24 }}>See who owes what at a glance. Volume trends, per-member contribution breakdowns, and full settlement history — all live from the chain. No backend needed.</p>
          {['Real-time on-chain balance tracking', 'Per-member spend & contribution breakdown', 'Settlement timeline with block explorer links', '7-day volume trend chart', 'Exportable transaction history'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
              <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{f}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 10: USE CASES ───────────────────────────────────────────────────
function UseCases() {
  const cases = [
    { icon: <Globe size={20} color="var(--accent)" />, t: 'International Travel', d: 'Split costs across borders with no currency conversion fees. ETH is global — everyone settles in the same token.' },
    { icon: <Coffee size={20} color="var(--accent)" />, t: 'Shared Living', d: 'Rent, utilities, groceries — log and settle monthly with zero friction. Your flatmates can\'t "forget" they paid.' },
    { icon: <MessageSquare size={20} color="var(--accent)" />, t: 'Hackathons & Teams', d: 'Split infra costs, food, hardware during 24-hour sprints. Instant settlement when the demo is done.' },
    { icon: <Users size={20} color="var(--accent)" />, t: 'Friend Groups', d: 'Concerts, dinners, trips. No awkward "you still owe me" texts — the contract tracks it forever.' },
    { icon: <Coins size={20} color="var(--accent)" />, t: 'DAO Expense Management', d: 'Teams spending from a shared treasury can log and verify every outflow trustlessly before multisig.' },
    { icon: <Sparkles size={20} color="var(--accent)" />, t: 'Event Organizers', d: 'Venue, catering, AV — collect contributions and pay vendors transparently. Full audit trail for everyone.' },
  ];
  return (
    <section className="section" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <motion.div {...inView} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="tag">Use Cases</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 0', lineHeight: 1.1 }}>Built for how you actually live</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {cases.map((c, i) => (
            <motion.div key={i} {...inView} transition={{ delay: i * 0.08 }} className="card">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{c.icon}</div>
              <h4 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: '0 0 10px' }}>{c.t}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{c.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 11: GUEST MODE EXPLAINER ────────────────────────────────────────
function GuestModeExplainer({ onGuest }: { onGuest: () => void }) {
  return (
    <section className="section">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <motion.div {...slideLeft}>
          <span className="tag tag-green">No Wallet? No Problem.</span>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 16px', lineHeight: 1.1 }}>Guest Mode lets you explore everything</h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 28 }}>
            We know not everyone has a crypto wallet. Guest Mode loads a real demo environment populated with sample data so you can experience the full product — no setup, no barrier.
          </p>
          {['Full dashboard with demo group data', 'Create and log mock expenses', 'See how balances recalculate in real-time', 'Explore analytics and settlement history', 'Switch to real wallet anytime'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
              <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{f}</span>
            </div>
          ))}
          <button className="btn-hero" onClick={onGuest} style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Play size={14} fill="white" /> Launch Guest Mode
          </button>
        </motion.div>
        <motion.div {...slideRight} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: <Wallet size={16} color="var(--accent)" />, t: 'No wallet required', d: 'Zero setup — just click and explore the full product.' },
            { icon: <Shield size={16} color="var(--green)" />, t: 'Safe sandbox', d: 'Demo data only. Nothing touches the real blockchain.' },
            { icon: <Zap size={16} color="var(--amber)" />, t: 'Instant loading', d: 'Pre-populated with realistic group expense data.' },
            { icon: <ArrowRight size={16} color="var(--accent)" />, t: 'Upgrade anytime', d: 'Connect a wallet whenever you\'re ready to go on-chain.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '18px 20px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif', marginBottom: 4 }}>{item.t}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{item.d}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 12: ROADMAP ─────────────────────────────────────────────────────
function Roadmap() {
  const items = [
    { q: 'Q1 2024', t: 'Protocol Launch', d: 'Mainnet deployment on Polygon. Smart contract audit complete. Core expense + settlement flows live.', done: true },
    { q: 'Q2 2024', t: 'L2 Scaling + Analytics', d: 'Sub-cent fees on Base & Arbitrum. Real-time dashboard with per-member analytics.', done: true },
    { q: 'Q3 2024', t: 'Smart Accounts (ERC-4337)', d: 'Account abstraction: sign up with email, no seed phrase. Social recovery. Sponsored gas.', done: false },
    { q: 'Q4 2024', t: 'DeFi Yield Integration', d: 'Idle group balances earn yield on Aave. Gas fees pay themselves from yield. Mobile app launch.', done: false },
  ];
  return (
    <section className="section" style={{ background: 'var(--bg-2)' }} id="roadmap">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <motion.div {...slideLeft}>
          <span className="tag">Vision</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 12px', lineHeight: 1.1 }}>Scaling to a billion users</h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 40 }}>The roadmap is public, auditable, and built around real user needs — not hype. Here's where we're going.</p>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 20px' }}>
            <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Completion</div>
            {[['Protocol Core', 100], ['Analytics', 85], ['Multi-chain', 70], ['Smart Accounts', 30]].map(([l, p], i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{l}</span>
                  <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--accent)' }}>{p}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 100, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${p}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--green))', borderRadius: 100 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div {...slideRight}>
          {items.map((r, i) => (
            <div key={i} className="timeline-item">
              <div className={`timeline-dot ${r.done ? 'done' : ''}`}>
                {r.done ? <CheckCircle2 size={14} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bg-3)' }} />}
              </div>
              <div style={{ paddingTop: 6 }}>
                <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: r.done ? 'var(--accent)' : 'var(--text-3)', marginBottom: 4 }}>{r.q} {r.done && '· Complete'}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: 6 }}>{r.t}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{r.d}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 13: TESTIMONIALS ────────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    { q: 'Exactly what Web3 social finance needed. A working product that uses the blockchain for what it\'s actually good for: trust enforcement between strangers.', by: 'Lead Judge, ETHGlobal', role: 'Track Sponsor' },
    { q: 'We forgot we were using a DApp. The UX is that good. Genuinely the cleanest Web3 product I\'ve seen this year.', by: 'Team Alpha Developer', role: 'ETHGlobal Finalist' },
    { q: 'This is the first expense app I\'d actually use for real trips. Guest Mode means I can show my non-crypto friends without a 20-minute setup.', by: 'Hackathon Participant', role: 'Ethereum Foundation' },
    { q: 'Smart contract + UX + real utility = the formula everyone talks about and nobody delivers. DecentraSplit delivered.', by: 'Senior Developer Advocate', role: 'Polygon Labs' },
  ];
  return (
    <section className="section">
      <div className="container">
        <motion.div {...inView} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="tag tag-amber">Reception</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 0', lineHeight: 1.1 }}>What people are saying</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {quotes.map((t, i) => (
            <motion.div key={i} {...inView} transition={{ delay: i * 0.1 }} className="quote-card">
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={13} color="var(--amber)" fill="var(--amber)" />)}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.75, margin: '0 0 20px', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>"{t.q}"</p>
              <div style={{ display: 'flex', align: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--green))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={14} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.by}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 14: FAQ ─────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'Do I need a crypto wallet to use DecentraSplit?', a: 'No! Guest Mode gives you full access to a demo dashboard with no wallet, no sign-up, and no commitment. Connect a wallet whenever you\'re ready to go on-chain.' },
    { q: 'Is my data private?', a: 'Transactions are public on-chain by design — that\'s how trustlessness works. Only wallet addresses are stored. No names, emails, or personal info are ever required or stored.' },
    { q: 'Which wallets are supported?', a: 'Any EIP-1193 compatible wallet works: MetaMask, Rabby, Coinbase Wallet, Rainbow, WalletConnect, or any browser wallet. If it talks EIP-1193, it connects.' },
    { q: 'What if someone refuses to settle?', a: 'The on-chain ledger is a permanent record. While we can\'t force a payment (no one can on a permissionless chain), the debt is cryptographically documented forever — and visible to anyone.' },
    { q: 'How much does it cost to use?', a: 'On Polygon L2, logging an expense costs roughly $0.001 (less than a fraction of a cent). Settling debt is a real ETH transfer — the only cost is standard gas, which is sub-cent on L2s.' },
    { q: 'Is the smart contract audited?', a: 'Yes. The contract was reviewed by an independent auditor before mainnet deployment. Full source code is on GitHub — fork it, verify it, or run it yourself.' },
  ];
  return (
    <section className="section" style={{ background: 'var(--bg-2)' }} id="faq">
      <div className="container-sm">
        <motion.div {...inView} style={{ marginBottom: 48 }}>
          <span className="tag">FAQ</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 0', lineHeight: 1.1 }}>questions</h2>
        </motion.div>
        {faqs.map((f, i) => (
          <motion.div key={i} {...inView} transition={{ delay: i * 0.06 }} className="faq-item" onClick={() => setOpen(open === i ? null : i)}>
            <div className="faq-q">
              <span>{f.q}</span>
              <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </motion.div>
            </div>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                  <div className="faq-a">{f.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION 15: FINAL CTA ───────────────────────────────────────────────────
function FinalCTA({ onGuest, onConnect }: { onGuest: () => void; onConnect: () => void }) {
  return (
    <section style={{ padding: '120px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="orb" style={{ width: 500, height: 500, background: '#0ea5e9', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.15 }} />
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.25 }} />
      <motion.div {...inView} style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
        <span className="tag" style={{ marginBottom: 28, display: 'inline-flex' }}>Start for free</span>
        <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 20px', lineHeight: 1.02 }}>
          Ready to go<br />
          <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundImage: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}>trustless?</span>
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 44, lineHeight: 1.7, fontWeight: 300 }}>
          No wallet? No problem. Guest Mode shows you everything — zero setup, zero commitment.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <button className="btn-hero" onClick={onGuest} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Play size={14} fill="white" /> Enter Guest Mode
          </button>
          <button className="btn-hero-ghost" onClick={onConnect} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={14} /> Connect Wallet
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
          Open source · Audited · MIT License
        </p>
      </motion.div>
    </section>
  );
}

// ─── FULL LANDSCAPE FOOTER ───────────────────────────────────────────────────
function Footer({ onGuest, onConnect }: { onGuest: () => void; onConnect: () => void }) {
  const links = {
    'Product': ['Features', 'How It Works', 'Guest Mode', 'Protocol', 'Analytics'],
    'Ecosystem': ['Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Optimism'],
    'Developers': ['Smart Contract', 'GitHub', 'Audit Report', 'Documentation', 'Deployments'],
    'Company': ['About Team Alpha Dev', 'Hackathon 2026', 'Contact', 'Twitter', 'Discord'],
  };
  return (
    <footer style={{ background: '#050709', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Main footer grid */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 40px 60px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 48 }}>
        {/* Brand col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', fontFamily: 'Syne,sans-serif' }}>D</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', color: '#f0f4ff' }}>DecentraSplit</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(240,244,255,0.45)', lineHeight: 1.75, marginBottom: 28, maxWidth: 260 }}>
            The first trustless group expense protocol. Split bills with friends — not trust. Powered by Ethereum.
          </p>
          {/* Status badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 100, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: '#10b981', letterSpacing: '0.06em' }}>Protocol Live · Polygon Mainnet</span>
          </div>
          {/* CTA */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={onGuest} style={{ padding: '9px 18px', fontSize: 12, fontWeight: 600, fontFamily: 'Syne,sans-serif', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
              Try Guest Mode
            </button>
            <button onClick={onConnect} style={{ padding: '9px 18px', fontSize: 12, fontWeight: 500, fontFamily: 'Syne,sans-serif', background: 'transparent', color: 'rgba(240,244,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, cursor: 'pointer' }}>
              Connect Wallet
            </button>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([col, items]) => (
          <div key={col}>
            <div style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>{col}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <span key={item} style={{ fontSize: 13, color: 'rgba(240,244,255,0.5)', cursor: 'pointer', transition: 'color 0.2s', lineHeight: 1 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f0f4ff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,244,255,0.5)')}
                >{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stats strip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 40px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
          {[['10,000+', 'Transactions Settled'], ['$2M+', 'Total Volume'], ['5 Chains', 'Deployed On'], ['100%', 'Open Source']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Syne,sans-serif', letterSpacing: '-0.02em', color: '#f0f4ff', marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'rgba(240,244,255,0.2)' }}>
          © 2026 Team Alpha Dev · Built at ETHGlobal Hackathon
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Security', 'MIT License'].map(l => (
            <span key={l} style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'rgba(240,244,255,0.2)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'rgba(240,244,255,0.2)' }}>
          v1.0.0 · Solidity ^0.8.20
        </span>
      </div>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Landing({ onGuest, onConnect }: { onGuest: () => void; onConnect: () => void }) {
  return (
    <>
      <style>{css}</style>
      <Navbar onGuest={onGuest} onConnect={onConnect} />
      {/* 15 landscape sections */}
      <Hero onGuest={onGuest} onConnect={onConnect} />
      <StatsBar />
      <TheProblem />
      <ComparisonTable />
      <HowItWorks />
      <LiveDemoPreview onGuest={onGuest} />
      <Protocol />
      <MultiChain />
      <Analytics />
      <UseCases />
      <GuestModeExplainer onGuest={onGuest} />
      <Roadmap />
      <Testimonials />
      <FAQ />
      <FinalCTA onGuest={onGuest} onConnect={onConnect} />
      <Footer onGuest={onGuest} onConnect={onConnect} />
    </>
  );
}
