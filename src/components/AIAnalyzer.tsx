import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Activity, Zap, TrendingUp, TrendingDown, Info, RefreshCw, BarChart3, Globe, Shield, Newspaper, AlertCircle, LineChart } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getGeneralAnalysis } from '../lib/gemini';
import TradingViewGauge from './TradingViewGauge';

interface AIAnalyzerProps {
  symbol: string;
  price: number;
}

/**
 * Maps internal app symbols to TradingView technical analysis symbols
 */
const getTVSymbol = (s: string) => {
  if (!s) return 'BINANCE:BTCUSDT';
  const symbol = s.replace('/', '').replace(' (OTC)', '').toUpperCase();
  
  // Specific crypto mappings
  if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOT', 'LTC', 'MATIC', 'LINK'].some(c => symbol.includes(c))) {
    // If it's already BINANCE:BTCUSDT etc, don't double up
    if (symbol.includes(':')) return symbol;
    return `BINANCE:${symbol.endsWith('USDT') ? symbol : symbol + 'USDT'}`;
  }
  
  // Forex
  const majorForex = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'];
  if (majorForex.includes(symbol)) {
    return `OANDA:${symbol}`;
  }
  
  // Commodities
  if (['XAUUSD', 'XAGUSD', 'GOLD', 'SILVER'].includes(symbol)) {
    const commMap: Record<string, string> = { 'GOLD': 'XAUUSD', 'SILVER': 'XAGUSD' };
    const mapped = commMap[symbol] || symbol;
    return `OANDA:${mapped}`;
  }
  
  // Indices
  if (['SPX500', 'NAS100', 'US30'].includes(symbol)) {
    return `FOREXCOM:${symbol}`;
  }

  // Fallback for simple stocks
  if (symbol.length <= 5 && !symbol.includes(':')) {
    return `NASDAQ:${symbol}`;
  }

  return symbol;
};

// Global cache to maintain the established AI analysis between tab switches
const analysisCache: Record<string, { text: any; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes TTL

export default function AIAnalyzer({ symbol: initialSymbol, price: currentPrice }: AIAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<'AI' | 'TECH' | 'NEWS'>('AI');
  const [targetSymbol, setTargetSymbol] = useState(initialSymbol);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fngData, setFngData] = useState<{ value: string; classification: string } | null>(null);

  useEffect(() => {
    setTargetSymbol(initialSymbol);
  }, [initialSymbol]);

  useEffect(() => {
    const fetchFNG = async () => {
      try {
        const res = await fetch('https://api.alternative.me/fng/');
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
          setFngData({
            value: data.data[0].value,
            classification: data.data[0].value_classification
          });
        }
      } catch (err) {
        console.warn("[FRAJA] FNG fetch failed or blocked:", err);
      }
    };
    fetchFNG();
  }, []);

  const performAnalysis = async (force: boolean = false) => {
    if (isAnalyzing || !targetSymbol) return;
    
    // Check cache first
    const cached = analysisCache[targetSymbol];
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setAnalysis(cached.text);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const text = await getGeneralAnalysis(targetSymbol, currentPrice);
      analysisCache[targetSymbol] = { text, timestamp: Date.now() };
      setAnalysis(text);
    } catch (err: any) {
      console.error("[FRAJA] Analysis Error:", err);
      const errorMessage = err?.message || String(err);
      setError(errorMessage.includes("quota") ? "Neural link saturated. Auto-retrying..." : "Tactical link failed. Check connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performAnalysis();
    }, 1500); // 1.5s debounce to save quota
    return () => clearTimeout(timer);
  }, [initialSymbol]);

  const newsItems = [
    { 
      id: 1, 
      title: "INSTITUTIONAL WHALE MOVEMENT DETECTED", 
      impact: "HIGH", 
      time: "2m ago", 
      summary: "Massive liquidity injection in major clusters. Potential volatility spike expected within next 15-30 minutes.",
      sentiment: "positive"
    },
    { 
      id: 2, 
      title: "CENTRAL BANK RATE DECISION IMMINENT", 
      impact: "CRITICAL", 
      time: "15m ago", 
      summary: "Market pricing in 25bps hike. Volatility protection protocols recommended for all active positions.",
      sentiment: "neutral"
    },
    { 
      id: 3, 
      title: "ORDER FLOW IMBALANCE AT KEY RESISTANCE", 
      impact: "MED", 
      time: "44m ago", 
      summary: "Significant sell-side resting orders identified at current H4 high. Fake-out potential is high.",
      sentiment: "negative"
    },
    { 
      id: 4, 
      title: "RETAIL LIQUIDITY SWEEP COMPLETED", 
      impact: "LOW", 
      time: "1h ago", 
      summary: "Lows cleared. Smart money repositioning for continuation. Watch for MSS on 1m timeframe.",
      sentiment: "positive"
    }
  ];

  return (
    <div className="bg-fraja-surface rounded-xl border border-fraja-border flex flex-col h-full overflow-hidden shadow-2xl relative">
      {/* SCANNING OVERLAY */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-[100] bg-fraja-black/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
           <div className="relative w-24 h-24 mb-8">
             <div className="absolute inset-0 border-2 border-fraja-gold/20 rounded-full animate-[spin_3s_linear_infinite]" />
             <div className="absolute inset-2 border-2 border-t-fraja-gold border-transparent rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
               <BrainCircuit className="w-8 h-8 text-fraja-gold animate-pulse" />
             </div>
           </div>
           <h3 className="text-xs font-black text-white tracking-[0.4em] uppercase mb-2 italic">Computing Neural setup</h3>
           <div className="flex gap-2 justify-center">
              <span className="text-[9px] text-fraja-gold font-mono animate-pulse uppercase tracking-widest font-black italic">FRAJA_INTELLIGENCE_INIT</span>
           </div>
        </div>
      )}

      {/* Header with Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-fraja-border bg-fraja-black">
        <div className="flex gap-1.5 p-1 bg-fraja-surface rounded-lg border border-fraja-border">
          {(['AI', 'TECH', 'NEWS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all tracking-widest",
                activeTab === tab 
                  ? "bg-fraja-gold text-fraja-black shadow-[0_0_15px_rgba(226,183,20,0.3)]" 
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tab === 'AI' ? 'FRAJA_INTEL' : tab === 'TECH' ? 'GAUGES' : 'FEED'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 h-7 px-3 rounded-lg bg-fraja-surface border border-fraja-border group transition-all">
             <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">NODE:</span>
             <span className="text-white text-[10px] font-mono font-bold uppercase">{initialSymbol}</span>
          </div>
          <button 
            onClick={() => performAnalysis(true)}
            disabled={isAnalyzing}
            className="w-7 h-7 flex items-center justify-center bg-fraja-gold/10 hover:bg-fraja-gold/20 border border-fraja-gold/30 rounded-lg group transition-all"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-fraja-gold group-hover:rotate-180 transition-transform duration-500", isAnalyzing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'AI' && (
            <motion.div
              key="ai-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
              role="tabpanel"
            >
              {!analysis && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-4">
                  <div className="p-4 rounded-full bg-fraja-gold/5 border border-fraja-gold/10 relative">
                    <div className="absolute inset-0 bg-fraja-gold/10 blur-2xl rounded-full" />
                    <BrainCircuit className="w-12 h-12 text-fraja-gold relative" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-black text-lg tracking-tighter uppercase italic">FRAJA_INTEL_STANDBY</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-[200px]">Strategic institutional analysis engine ready for initialization.</p>
                  </div>
                  <button 
                    onClick={() => performAnalysis(true)}
                    className="px-8 py-3 bg-fraja-gold text-fraja-black font-black rounded-xl text-[10px] hover:scale-105 transition-transform shadow-[0_0_30px_rgba(226,183,20,0.1)] uppercase tracking-[0.2em]"
                  >
                    INITIALIZE NEURAL LINK
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-red-500 font-bold text-[10px] uppercase tracking-widest">Neural Link Sync Failed</h4>
                    <p className="text-red-400/60 text-[10px] leading-relaxed italic">{error}</p>
                  </div>
                </div>
              )}

              {analysis && !isAnalyzing && (
                <div className="space-y-6">
                  {/* FNG Monitor */}
                  {fngData && (
                    <div className="p-4 rounded-xl bg-fraja-black border border-fraja-border space-y-4 shadow-inner relative overflow-hidden group">
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                           <Activity className={cn("w-3.5 h-3.5", Number(fngData.value) > 60 ? "text-green-500" : Number(fngData.value) < 40 ? "text-red-500" : "text-fraja-gold" )} />
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Fear & Greed Index</span>
                        </div>
                        <span className={cn(
                          "text-xs font-black font-mono tracking-tighter italic",
                          Number(fngData.value) > 60 ? "text-green-500" : Number(fngData.value) < 40 ? "text-red-500" : "text-fraja-gold"
                        )}>
                          {fngData.value} - {fngData.classification}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-fraja-surface rounded-full overflow-hidden relative z-10 border border-fraja-border">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${fngData.value}%` }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className={cn(
                             "h-full",
                             Number(fngData.value) > 60 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
                             Number(fngData.value) < 40 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                             "bg-fraja-gold shadow-[0_0_10px_rgba(226,183,20,0.5)]"
                           )}
                         />
                      </div>
                    </div>
                  )}

                  {/* Confidence Monitor Removed */}

                  <div className="markdown-body prose prose-invert max-w-none 
                    prose-h1:text-xl prose-h1:font-black prose-h1:tracking-tighter prose-h1:text-white prose-h1:border-b prose-h1:border-fraja-border prose-h1:pb-4 prose-h1:mb-6
                    prose-h3:text-[10px] prose-h3:font-black prose-h3:text-fraja-gold prose-h3:uppercase prose-h3:tracking-[0.25em] prose-h3:mb-2 prose-h3:mt-8 italic
                    prose-p:text-[12px] prose-p:text-gray-400 prose-p:leading-relaxed
                    prose-li:text-[12px] prose-li:text-gray-300
                    prose-strong:text-fraja-cyan prose-strong:font-black
                  ">
                    <Markdown>{analysis}</Markdown>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'NEWS' && (
            <motion.div
              key="news-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-3"
              role="tabpanel"
            >
              {newsItems.map((news) => (
                <div key={news.id} className="p-4 rounded-xl bg-fraja-black border border-fraja-border hover:border-fraja-gold/30 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <span className={cn(
                         "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest",
                         news.impact === 'CRITICAL' ? "bg-red-600 text-white" :
                         news.impact === 'HIGH' ? "bg-orange-600 text-white" :
                         "bg-fraja-surface text-gray-500 border border-fraja-border"
                       )}>
                         {news.impact}
                       </span>
                       <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">{news.time}</span>
                     </div>
                     {news.sentiment === 'positive' ? <TrendingUp className="w-3 h-3 text-green-500" /> : 
                      news.sentiment === 'negative' ? <TrendingDown className="w-3 h-3 text-red-500" /> : 
                      <Activity className="w-3 h-3 text-fraja-cyan" /> }
                   </div>
                   <h3 className="text-[11px] font-black text-white uppercase tracking-tight mb-2 group-hover:text-fraja-gold transition-colors italic">
                     {news.title}
                   </h3>
                   <p className="text-[10px] text-gray-500 leading-relaxed italic">
                     "{news.summary}"
                   </p>
                </div>
              ))}
            </motion.div>
          )}
          
          {activeTab === 'TECH' && (
            <motion.div
              key="tech-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full min-h-[380px]"
              role="tabpanel"
            >
              <TradingViewGauge symbol={getTVSymbol(targetSymbol)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-3 bg-fraja-black border-t border-fraja-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-fraja-gold animate-pulse" />
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">FRAJA_COMPUTE_ACTIVE</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-fraja-cyan shadow-[0_0_8px_rgba(0,223,255,0.5)]" />
           <span className="text-[8px] font-mono text-gray-600 uppercase font-black">LATENCY: 42MS</span>
        </div>
      </div>
    </div>
  );
}
