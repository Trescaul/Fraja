import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, ChevronRight, GraduationCap, Target, Zap, Waves, LineChart, ShieldCheck, ArrowRight, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './Auth';

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: 'BASICS' | 'STRATEGY' | 'SMC' | 'RISK';
  content: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
}

const LESSONS: Lesson[] = [
  {
    id: 'forex-basics-101',
    title: 'The Currency Hierarchy',
    category: 'BASICS',
    difficulty: 'Beginner',
    duration: '8 min',
    description: 'Understanding Majors, Minors, and the mechanics of a currency pair exchange.',
    content: (
      <div className="space-y-6 text-gray-300">
        <div className="p-6 rounded-2xl bg-fraja-cyan/5 border border-fraja-cyan/20">
          <h4 className="text-fraja-cyan font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
            Core Concept: The Exchange
          </h4>
          <p className="text-sm">In Forex, you are always buying one currency and selling another. The first currency is the <strong>Base</strong>, the second is the <strong>Quote</strong>.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-fraja-border">
            <span className="text-white font-bold block mb-1">Pip Mechanics</span>
            <p className="text-xs text-gray-400">A "Point in Percentage" is usually the 4th decimal place. It is the unit of measure for profit and loss.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-fraja-border">
            <span className="text-white font-bold block mb-1">Market Sessions</span>
            <p className="text-xs text-gray-400">London/NY overlap provides the highest liquidity and "Smart Money" moves.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'smc-fundamentals',
    title: 'SMC: The Core Architecture',
    category: 'SMC',
    difficulty: 'Intermediate',
    duration: '15 min',
    description: 'Learn how institutional algorithms view market structure through liquidity and order flow.',
    content: (
      <div className="space-y-6 text-gray-300">
        <div className="p-6 rounded-2xl bg-fraja-gold/5 border border-fraja-gold/20 mb-8">
          <h4 className="text-fraja-gold font-bold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            THE INSTITUTIONAL PERSPECTIVE
          </h4>
          <p className="text-sm leading-relaxed">
            Markets are not random. They are driven by liquidity. Smart Money Concepts (SMC) focus on identifying where large institutions are building positions and where they are likely to "trap" retail traders.
          </p>
        </div>

        <section className="space-y-4">
          <h5 className="text-white font-bold text-base uppercase tracking-widest">1. Market Structure Shift (MSS)</h5>
          <p className="text-sm">
            The most critical signal for a trend reversal. When price breaks the previous "Strong Low" or "Strong High", it signals a change in institutional direction.
          </p>
          <div className="aspect-video bg-black/40 rounded-xl border border-fraja-border flex flex-col items-center justify-center p-8 relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,theme(colors.fraja-gold),transparent)]" />
             <div className="w-full h-px bg-gray-800 absolute top-1/2 -translate-y-1/2" />
             <div className="h-full w-px bg-gray-800 absolute left-1/2 -translate-x-1/2" />
             <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Visual Representation of MSS */}
                <div className="flex items-center gap-1 absolute top-1/4 left-1/4">
                  <div className="w-12 h-0.5 bg-green-500 rotate-[-45deg] origin-right" />
                  <div className="w-12 h-0.5 bg-green-500 rotate-[45deg] origin-left" />
                  <div className="w-12 h-0.5 bg-green-500 rotate-[-45deg] origin-right" />
                  <div className="w-24 h-0.5 bg-red-500 rotate-[45deg] origin-left relative">
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-red-500 font-bold uppercase tracking-widest">MSS: Structural Break</div>
                  </div>
                </div>
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <h5 className="text-white font-bold text-base uppercase tracking-widest">2. Fair Value Gaps (FVG)</h5>
          <p className="text-sm">
            Gaps created by impulsive movements where only one side of the market (buyers or sellers) was dominant. These act as "magnets" for future price action.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-fraja-border">
              <span className="text-[10px] font-bold text-fraja-cyan uppercase block mb-2">Bullish FVG</span>
              <p className="text-[11px] text-gray-500">Price returns to fill the gap before continuing the rally.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-fraja-border">
              <span className="text-[10px] font-bold text-red-500 uppercase block mb-2">Bearish FVG</span>
              <p className="text-[11px] text-gray-500">Price retraces into the gap to rebalance sell orders.</p>
            </div>
          </div>
        </section>
      </div>
    )
  },
  {
    id: 'smc-liquidity',
    title: 'Liquidity & Inducement',
    category: 'SMC',
    difficulty: 'Intermediate',
    duration: '12 min',
    description: 'Identifying where the retail "Stop Losses" are resting and why the market hunts them.',
    content: (
      <div className="space-y-6 text-gray-300">
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 mb-8">
          <h4 className="text-red-500 font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
            The Predator Rule
          </h4>
          <p className="text-sm">
            Institutional traders need huge volume to fill their orders. They get this volume by triggering your Stop Losses. Your "Exit" is their "Entry".
          </p>
        </div>

        <section className="space-y-4">
          <h5 className="text-white font-bold text-base uppercase tracking-widest">Types of Liquidity</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-fraja-surface border border-fraja-border">
              <span className="text-fraja-gold font-bold block mb-1">Equal Highs/Lows (EQH/EQL)</span>
              <p className="text-xs text-gray-400">Retail "Support and Resistance". These levels are guaranteed to be swept before a real move happens.</p>
            </div>
            <div className="p-4 rounded-xl bg-fraja-surface border border-fraja-border">
              <span className="text-fraja-gold font-bold block mb-1">Trendline Liquidity</span>
              <p className="text-xs text-gray-400">Diagonal levels where traders place stops. Institutions "rake" these zones clean before the actual reversal.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h5 className="text-white font-bold text-base uppercase tracking-widest">Inducement (IDM)</h5>
          <p className="text-sm">
            A small "fake" break of structure designed to lure traders into early entries. The true move usually happens after this inducement is swept.
          </p>
          <div className="p-5 rounded-2xl bg-black/40 border border-fraja-border text-center">
             <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">STOP_HUNT_DETECTED</span>
             <div className="mt-4 flex items-center justify-center gap-4">
                <div className="w-16 h-1 bg-gray-800 relative">
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 blur-sm" />
                </div>
                <span className="text-[11px] font-bold">Liquidity Sweep</span>
                <div className="w-16 h-1 bg-gray-800 relative">
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-green-500 blur-sm" />
                </div>
             </div>
          </div>
        </section>
      </div>
    )
  },
  {
    id: 'smc-bos-choch',
    title: 'BOS vs CHoCH: The Bias Node',
    category: 'SMC',
    difficulty: 'Intermediate',
    duration: '10 min',
    description: 'Differentiating between trend continuation and structural reversals.',
    content: (
      <div className="space-y-6 text-gray-300">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm uppercase tracking-widest">BOS (Break of Structure)</h5>
            <p className="text-[11px] text-gray-400">Occurs when price breaks a high/low in the <span className="text-green-500">SAME</span> direction as the current trend. Confirms continuation.</p>
            <div className="h-32 bg-fraja-surface rounded-xl border border-fraja-border flex items-center justify-center">
               <div className="w-1/2 h-1/2 border-t-2 border-r-2 border-dashed border-fraja-gold rotate-45 translate-y-2" />
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm uppercase tracking-widest">CHoCH (Change of Character)</h5>
            <p className="text-[11px] text-gray-400">Occurs when price breaks the <span className="text-red-500">PREVIOUS</span> low/high after reaching a Supply/Demand zone. Signals reversal.</p>
            <div className="h-32 bg-fraja-surface rounded-xl border border-fraja-border flex items-center justify-center">
               <div className="w-1/2 h-1/2 border-b-2 border-l-2 border-solid border-red-500 -rotate-45 -translate-y-2" />
            </div>
          </div>
        </div>
        <p className="text-sm font-medium italic p-4 bg-fraja-gold/5 border border-fraja-gold/20 rounded-xl">
           "A CHoCH is only valid if it occurs from a Higher Timeframe (HTF) Point of Interest (POI)."
        </p>
      </div>
    )
  },
  {
    id: 'smc-premium-discount',
    title: 'Premium vs Discount Optimization',
    category: 'SMC',
    difficulty: 'Intermediate',
    duration: '8 min',
    description: 'Stop buying at high prices. Use institutional zones to find value.',
    content: (
      <div className="space-y-6 text-gray-300">
        <div className="relative p-8 rounded-3xl bg-fraja-surface border border-fraja-border overflow-hidden">
           <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 bg-red-500/5 border-b border-red-500/20 flex items-center justify-center">
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">PREMIUM (SELL ZONE)</span>
              </div>
              <div className="h-px bg-white/10 relative">
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 bg-fraja-surface text-[9px] font-mono">EQUILIBRIUM (0.5)</div>
              </div>
              <div className="flex-1 bg-green-500/5 border-t border-green-500/20 flex items-center justify-center">
                 <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">DISCOUNT (BUY ZONE)</span>
              </div>
           </div>
           <div className="relative z-10 space-y-4 py-8">
              <p className="text-xs text-gray-400 max-w-[200px]">Institutions sell at Premium prices and buy at Discounted prices. We follow the giant.</p>
           </div>
        </div>
        <section className="space-y-3">
          <h5 className="text-white font-bold text-sm uppercase tracking-widest">Operational Protocol:</h5>
          <ul className="space-y-2 text-xs">
            <li className="flex gap-3"><div className="w-1 h-1 rounded-full bg-fraja-gold mt-1.5" /> Only take SHORTS if price is above the 50% Equilibrium level of the current range.</li>
            <li className="flex gap-3"><div className="w-1 h-1 rounded-full bg-fraja-gold mt-1.5" /> Only take LONGS if price is below the 50% Equilibrium level of the current range.</li>
          </ul>
        </section>
      </div>
    )
  },
  {
    id: 'order-block-node',
    title: 'Order Block Identification',
    category: 'SMC',
    difficulty: 'Advanced',
    duration: '18 min',
    description: 'Pinpointing the exact candles where smart money institutions have left their footprint.',
    content: (
      <div className="space-y-6 text-gray-300">
        <h5 className="text-white font-bold text-base uppercase tracking-widest">Identifying the Footprint</h5>
        <div className="p-5 rounded-xl bg-black/60 border-l-4 border-fraja-gold italic text-sm">
          "An Order Block is the last opposite candle before a strong impulsive move that breaks structure."
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
             <div className="w-1/3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
               <span className="text-[10px] font-black text-red-500">BEARISH OB</span>
               <div className="h-12 w-4 bg-green-500 mx-auto my-2" />
               <div className="h-24 w-4 bg-red-500 mx-auto" />
             </div>
             <div className="flex-1 text-xs space-y-2 py-2">
               <p><span className="text-fraja-gold font-bold">1. Impulse:</span> Rapid displacement away from the zone.</p>
               <p><span className="text-fraja-gold font-bold">2. Inefficiency:</span> Leaves a Fair Value Gap behind.</p>
               <p><span className="text-fraja-gold font-bold">3. Mitigation:</span> We enter when price returns to touch the OB.</p>
             </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'smc-mitigation',
    title: 'The Mitigation Cycle',
    category: 'SMC',
    difficulty: 'Advanced',
    duration: '15 min',
    description: 'Understanding why institutions must return to their "drawdown" positions before continuing.',
    content: (
      <div className="space-y-6 text-gray-300">
        <p className="text-sm leading-relaxed">
          When institutions want to push price down, they often buy first to trigger retail stops, then aggressively sell. This leaves their initial "Buy" orders in drawdown. They <span className="text-fraja-gold">MUST</span> return to the zone to close those orders at break-even. This is Mitigation.
        </p>
        
        <div className="p-6 rounded-2xl bg-fraja-surface border border-fraja-border flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cycle State</span>
              <span className="text-[10px] font-bold text-fraja-gold uppercase tracking-widest">PENDING_MITIGATION</span>
           </div>
           <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-fraja-gold animate-pulse" />
           </div>
           <p className="text-[11px] text-gray-400">Price has broken structure but has NOT yet returned to the supply/demand zone. Entering now is low probability.</p>
        </div>
      </div>
    )
  },
  {
    id: 'smc-entry-types',
    title: 'Precision Entry Protocols',
    category: 'SMC',
    difficulty: 'Advanced',
    duration: '25 min',
    description: 'Refining your entries on the 1M and 5M timeframes for insane R:R ratios.',
    content: (
      <div className="space-y-6 text-gray-300">
        <div className="space-y-4">
          <h5 className="text-white font-bold text-sm uppercase tracking-widest">The Risk Entry (Aggressive)</h5>
          <p className="text-xs text-gray-400">Placing a limit order directly at the 50% or "Open" of the HTF Order Block. Highest R:R but lower probability.</p>
          
          <h5 className="text-white font-bold text-sm uppercase tracking-widest">The Confirmation Entry (Conservative)</h5>
          <p className="text-xs text-gray-400">Waiting for price to reach the HTF zone, then watching for a LTF (1M or 5M) CHoCH before entering. Highest probability.</p>
        </div>

        <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20">
           <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">PROFESSIONAL WORKFLOW</span>
           </div>
           <ol className="space-y-3 text-[11px]">
             <li>1. Identify 4H Supply/Demand Zone.</li>
             <li>2. Wait for price to tap the 4H zone.</li>
             <li>3. Drop to 1M timeframe.</li>
             <li>4. Identify 1M CHoCH.</li>
             <li>5. Enter at the 1M Order Block created by the CHoCH.</li>
           </ol>
        </div>
      </div>
    )
  },
  {
    id: 'trend-confluence',
    title: 'Multi-Timeframe Confluence',
    category: 'STRATEGY',
    difficulty: 'Intermediate',
    duration: '12 min',
    description: 'Aligning the HTF narrative with LTF execution for high-strike rate setups.',
    content: (
      <div className="space-y-6 text-gray-300">
        <div className="p-6 rounded-2xl bg-white/5 border border-fraja-border relative overflow-hidden">
           <Waves className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-5 text-fraja-gold" />
           <h5 className="text-white font-bold mb-4">The Top-Down Protocol</h5>
           <ul className="space-y-3 text-sm relative z-10">
             <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-fraja-gold" /> Monthly/Weekly: Overall Direction</li>
             <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-fraja-gold" /> Daily/4H: Key Supply/Demand Zones</li>
             <li className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-fraja-gold" /> 15M/5M: Execution & Entry Signals</li>
           </ul>
        </div>
      </div>
    )
  },
  {
    id: 'risk-management-node',
    title: 'The Algorithmic Risk Shield',
    category: 'RISK',
    difficulty: 'Beginner',
    duration: '10 min',
    description: 'Why you fail: Mathematically proving why position sizing is more important than your entry.',
    content: (
      <div className="space-y-6 text-gray-300">
        <div className="grid grid-cols-3 gap-4 mb-8">
           {[
             { label: 'MAX RISK', val: '1-2%', color: 'text-red-500' },
             { label: 'MIN R:R', val: '1:3', color: 'text-fraja-gold' },
             { label: 'DAILY STOP', val: '5%', color: 'text-gray-400' }
           ].map(stat => (
             <div key={stat.label} className="p-4 rounded-2xl bg-fraja-surface border border-fraja-border text-center">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{stat.label}</span>
                <span className={cn("text-xl font-mono font-bold", stat.color)}>{stat.val}</span>
             </div>
           ))}
        </div>

        <section className="space-y-4">
          <h5 className="text-white font-bold text-base uppercase tracking-widest">The Risk/Ruin Paradox</h5>
          <p className="text-sm leading-relaxed">
            Without strict risk management, a 90% win-rate strategy can still result in a blown account. If you risk 10% per trade, 7 consecutive losses leaves you with only 47% of your capital.
          </p>
          <div className="p-5 rounded-2xl bg-black/40 border border-fraja-border font-mono text-[11px]">
             <div className="flex justify-between mb-2">
               <span className="text-gray-500">1% Risk / 1:3 R:R</span>
               <span className="text-green-500">SURVIVAL_MODE = ON</span>
             </div>
             <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-4">
               <div className="bg-green-500 h-full w-[100%]" />
             </div>
             <div className="flex justify-between mb-2">
               <span className="text-gray-500">10% Risk / Gamble</span>
               <span className="text-red-500">LIQUIDATION_RISK = HIGH</span>
             </div>
             <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
               <div className="bg-red-500 h-full w-[25%]" />
             </div>
          </div>
        </section>
      </div>
    )
  },
  {
    id: 'trading-psychology',
    title: 'The Emotion Processor',
    category: 'RISK',
    difficulty: 'Intermediate',
    duration: '14 min',
    description: 'Removing the biological bias from your execution through systematic discipline.',
    content: (
      <div className="space-y-6 text-gray-300">
        <h5 className="text-white font-bold uppercase text-xs tracking-[0.2em] mb-4">Mental Firewall Activation</h5>
        <div className="space-y-4">
           {[
             { title: 'FOMO Suppression', desc: 'The market will be here tomorrow. There is no "last train".' },
             { title: 'Revenge Control', desc: 'The market does not owe you anything. A loss is a data point, not a personal attack.' },
             { title: 'Outcome Independence', desc: 'Focus on the process, not the profit. The numbers are a byproduct of discipline.' }
           ].map(m => (
             <div key={m.title} className="p-4 rounded-xl bg-fraja-surface border border-fraja-border border-l-fraja-gold border-l-2">
               <span className="text-[10px] font-black text-white uppercase block mb-1">{m.title}</span>
               <p className="text-[11px] text-gray-500">{m.desc}</p>
             </div>
           ))}
        </div>
      </div>
    )
  },
  {
    id: 'intro-to-fraja-ai',
    title: 'Leveraging FRAJA Intelligence',
    category: 'STRATEGY',
    difficulty: 'Advanced',
    duration: '20 min',
    description: 'How to combine the Intelligence Node with your manual bias for high-confluence entries.',
    content: (
      <div className="space-y-6 text-gray-300">
        <h5 className="text-white font-bold text-base uppercase tracking-widest">The Confluence Engine</h5>
        <p className="text-sm">
          FRAJA is more than a signal bot. It is a confluence filter. Use this workflow for high-probability setups:
        </p>

        <div className="space-y-3">
          {[
            { step: 1, text: 'Define HTF Bias (1H/4H Trend)', icon: LineChart },
            { step: 2, text: 'Request Intelligence Node analysis of the LTF structure', icon: Brain },
            { step: 3, text: 'Wait for 85%+ S_ACC Confidence rating', icon: Zap },
            { step: 4, text: 'Execute only when Signal matches your manual MSS bias', icon: Target }
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-4 p-4 rounded-xl bg-fraja-surface border border-fraja-border group hover:border-fraja-gold/50 transition-all text-left">
               <div className="w-8 h-8 rounded-lg bg-fraja-gold/10 flex items-center justify-center text-fraja-gold font-black text-xs shrink-0">
                 {s.step}
               </div>
               <p className="text-[12px] font-bold text-gray-400 group-hover:text-white transition-colors">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
];

export default function Academy() {
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('BASICS');
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load progress from Firestore
    const progressRef = doc(db, 'users', user.uid, 'academy', 'progress');
    
    const unsubscribe = onSnapshot(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.completedIds && Array.isArray(data.completedIds)) {
          setCompletedLessonIds(new Set(data.completedIds));
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, progressRef.path);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredLessons = LESSONS.filter(l => l.category === activeCategory);

  const handleFinalize = async (lessonId: string) => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    const newCompletedIds = new Set(completedLessonIds);
    newCompletedIds.add(lessonId);

    const progressRef = doc(db, 'users', user.uid, 'academy', 'progress');
    try {
      await setDoc(progressRef, {
        completedIds: Array.from(newCompletedIds),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setCompletedLessonIds(newCompletedIds);
      
      // Auto-select next lesson if available in the same category
      const currentIndex = filteredLessons.findIndex(l => l.id === lessonId);
      if (currentIndex < filteredLessons.length - 1) {
        setTimeout(() => {
          setSelectedLesson(filteredLessons[currentIndex + 1]);
        }, 800);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, progressRef.path);
    } finally {
      setIsSyncing(false);
    }
  };

  const calculateRank = (count: number) => {
    if (count >= 10) return 'MASTER_TRADER';
    if (count >= 5) return 'SENIOR_ANALYST';
    if (count >= 3) return 'JUNIOR_ANALYST';
    return 'RECRUIT';
  };

  const progressCount = completedLessonIds.size;
  const totalLessons = LESSONS.length;

  return (
    <div className="h-full flex flex-col font-sans bg-fraja-black">
      <header className="px-8 py-6 border-b border-fraja-border bg-fraja-surface/30 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <GraduationCap className="w-6 h-6 text-fraja-gold" />
            <h1 className="text-2xl font-black uppercase tracking-tight text-white italic">FRAJA<span className="text-fraja-gold">_ACADEMY</span></h1>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Operational Training Modules for the Professional Executioner</p>
        </div>
        
        <div className="flex items-center gap-10">
           <div className="flex flex-col items-end">
             <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-none mb-1">Modules Cleared</span>
             <span className="text-lg font-mono font-bold text-fraja-gold">{progressCount.toString().padStart(2, '0')} / {totalLessons.toString().padStart(2, '0')}</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-none mb-1">Certification Rank</span>
             <span className="text-lg font-mono font-bold text-gray-400">{calculateRank(progressCount)}</span>
           </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Module Sidebar */}
        <div className="w-80 border-r border-fraja-border bg-fraja-black/50 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
          <div className="space-y-2">
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Module Hierarchy</span>
            <div className="space-y-1">
              {['BASICS', 'STRATEGY', 'SMC', 'RISK'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedLesson(null);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest border",
                    activeCategory === cat 
                      ? "text-fraja-gold bg-fraja-gold/10 border-fraja-gold/40" 
                      : "text-gray-500 border-transparent hover:text-white hover:bg-white/5"
                  )}
                >
                  {cat}
                  <ChevronRight className={cn("w-3 h-3 transition-transform", activeCategory === cat ? "rotate-90 text-fraja-gold" : "opacity-30")} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-fraja-border">
            <div className="flex items-center justify-between px-1 mb-2">
               <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">Active nodes</span>
               <span className="text-[9px] text-fraja-gold font-mono">{filteredLessons.length} Modules</span>
            </div>
            {filteredLessons.map((lesson) => {
              const isCompleted = completedLessonIds.has(lesson.id);
              return (
                <button 
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left transition-all group relative overflow-hidden",
                    selectedLesson?.id === lesson.id 
                      ? "bg-fraja-gold border-fraja-gold-bright shadow-[0_0_20px_rgba(226,183,20,0.2)]" 
                      : "bg-fraja-surface border-fraja-border hover:border-gray-600",
                    isCompleted && selectedLesson?.id !== lesson.id && "bg-fraja-gold/5 border-fraja-gold/20"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                         selectedLesson?.id === lesson.id ? "bg-black text-fraja-gold" : "bg-fraja-gold/10 text-fraja-gold"
                       )}>
                         {lesson.category}
                       </span>
                       {isCompleted && (
                         <div className={cn(
                           "flex items-center gap-1",
                           selectedLesson?.id === lesson.id ? "text-black" : "text-green-500"
                         )}>
                           <ShieldCheck className="w-3 h-3" />
                           <span className="text-[7px] font-black uppercase">Cleared</span>
                         </div>
                       )}
                    </div>
                    <span className={cn(
                      "text-[8px] font-bold uppercase",
                      selectedLesson?.id === lesson.id ? "text-fraja-black" : "text-gray-600"
                    )}>
                      {lesson.duration}
                    </span>
                  </div>
                  <h4 className={cn(
                    "text-[11px] font-black uppercase leading-tight transition-colors",
                    selectedLesson?.id === lesson.id ? "text-fraja-black" : "text-white"
                  )}>
                    {lesson.title}
                  </h4>
                  <div className={cn(
                    "mt-3 flex items-center gap-1.5 transition-opacity",
                    selectedLesson?.id === lesson.id ? "opacity-100 text-fraja-black" : "opacity-0 group-hover:opacity-100 text-fraja-gold"
                  )}>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Connect Node</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
            {filteredLessons.length === 0 && (
               <div className="text-center py-8 opacity-20">
                  <Zap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">No modules linked</span>
               </div>
            )}
          </div>
        </div>

        {/* Lesson Viewport */}
        <div className="flex-1 bg-fraja-black/80 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
             {selectedLesson ? (
               <motion.div 
                 key={selectedLesson.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="absolute inset-0 flex flex-col p-12 overflow-y-auto custom-scrollbar"
               >
                  <div className="max-w-3xl mx-auto w-full space-y-12 pb-24">
                     <div className="space-y-4 text-left">
                        <div className="flex flex-wrap items-center gap-4">
                           <div className="flex items-center gap-2 px-3 py-1 bg-fraja-gold/20 rounded-full border border-fraja-gold/30">
                              <ShieldCheck className="w-3.5 h-3.5 text-fraja-gold" />
                              <span className="text-[10px] font-black text-fraja-gold uppercase tracking-tighter">SECURE_LEVEL: {selectedLesson.difficulty}</span>
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1 bg-fraja-cyan/20 rounded-full border border-fraja-cyan/30">
                              <Zap className="w-3.5 h-3.5 text-fraja-cyan" />
                              <span className="text-[10px] font-black text-fraja-cyan uppercase tracking-tighter">EST_TIME: {selectedLesson.duration}</span>
                           </div>
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{selectedLesson.title}</h2>
                        <p className="text-lg text-gray-500 font-medium italic leading-relaxed">
                          {selectedLesson.description}
                        </p>
                     </div>

                     <div className="h-px w-full bg-gradient-to-r from-fraja-border via-fraja-gold/20 to-fraja-border" />

                     <div className="lesson-content text-left">
                        {selectedLesson.content}
                     </div>

                     <div className="pt-12 flex items-center justify-between gap-6">
                        <div className="flex-1 h-px bg-fraja-border" />
                        <button 
                          onClick={() => handleFinalize(selectedLesson.id)}
                          disabled={completedLessonIds.has(selectedLesson.id) || isSyncing}
                          className={cn(
                            "px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3",
                            completedLessonIds.has(selectedLesson.id)
                              ? "bg-green-500 text-white cursor-default"
                              : "bg-fraja-gold text-fraja-black shadow-2xl shadow-fraja-gold/20 hover:scale-[1.02] active:scale-[0.98]",
                            isSyncing && "opacity-50 cursor-wait"
                          )}
                        >
                           {isSyncing ? 'Syncing...' : (completedLessonIds.has(selectedLesson.id) ? 'Module Cleared' : 'Finalize Module')}
                           {isSyncing ? (
                             <Loader2 className="w-4 h-4 animate-spin" />
                           ) : (
                             completedLessonIds.has(selectedLesson.id) ? <ShieldCheck className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />
                           )}
                        </button>
                        <div className="flex-1 h-px bg-fraja-border" />
                     </div>
                  </div>
               </motion.div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 rounded-[40px] bg-fraja-surface border border-fraja-border flex items-center justify-center mb-8 relative group">
                     <div className="absolute inset-0 bg-fraja-gold/10 blur-2xl rounded-full animate-pulse" />
                     <BookOpen className="w-10 h-10 text-gray-700 group-hover:text-fraja-gold transition-colors relative z-10" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-4">Transmission Standby</h3>
                  <p className="max-w-md text-gray-600 font-bold uppercase tracking-widest text-[10px] leading-loose">
                    Select an operational training module from the {activeCategory} hierarchy node to initiate high-frequency education protocols.
                  </p>
                  
                  <div className="mt-12 grid grid-cols-3 gap-8 opacity-20">
                     {[LineChart, Brain, ShieldCheck].map((Icon, i) => (
                       <Icon key={i} className="w-8 h-8 text-gray-600" />
                     ))}
                  </div>
               </div>
             )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
