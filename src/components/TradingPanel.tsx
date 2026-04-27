import React, { useState } from 'react';
import { Shield, Target, TrendingUp, Zap, Brain } from 'lucide-react';
import { analyzeMarket } from '../lib/gemini';
import { cn } from '../lib/utils';

interface TradeParams {
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
}

// Global cache for trading signals outside component to survive unmounts
const globalSignalCache: Record<string, { signal: any, timestamp: number }> = {};

export default function TradingPanel({ 
  symbol, 
  currentPrice,
  isAuto,
  timeframe = "1m",
  onAutoToggle,
  onMarketTrade,
  candles
}: { 
  symbol: string, 
  currentPrice: number,
  isAuto?: boolean,
  timeframe?: string,
  onAutoToggle?: () => void,
  onMarketTrade?: (type: 'BUY' | 'SELL') => void,
  candles?: any[]
}) {
  const [params, setParams] = useState<TradeParams>({
    stopLoss: 1,
    takeProfit: 2,
    lotSize: 0.1,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [signal, setSignal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'trailing' | 'oco'>('market');
  const [limitPrice, setLimitPrice] = useState(currentPrice);

  // Sync limit price with current price if type changes or if it was just selected
  const handleTypeChange = (type: 'market' | 'limit' | 'trailing' | 'oco') => {
    setOrderType(type);
    if (type !== 'market') {
      setLimitPrice(currentPrice);
    }
  };

  // Restore from cache on mount
  React.useEffect(() => {
    const cached = globalSignalCache[symbol];
    if (cached && Date.now() - cached.timestamp < 1000 * 60 * 15) { // 15 mins
      setSignal(cached.signal);
    }
  }, [symbol]);

  const handleAIAnalysis = async () => {
    if (!candles || candles.length < 5 || analyzing) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeMarket(candles, timeframe, symbol);
      globalSignalCache[symbol] = { signal: result, timestamp: Date.now() };
      setSignal(result);
    } catch (e: any) {
      console.error("[FRAJA] Strategy Error:", e);
      const msg = e?.message || String(e);
      if (msg.includes("quota") || msg.includes("429") || e?.status === 429) {
        setError("Neural link saturated. Auto-retrying...");
      } else {
        setError("Tactical analysis failed. Verify node connectivity.");
      }
    } finally {
      // Extra safety cooldown
      setTimeout(() => setAnalyzing(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-0 bg-transparent font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-2">
          EXECUTION NODE
        </h2>
        <div className="flex items-center gap-1.5">
           <Zap className="w-3.5 h-3.5 text-fraja-gold" />
           <span className="text-[9px] text-fraja-gold font-bold uppercase italic tracking-wider">FRAJA_READY</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-5 rounded-xl bg-fraja-gold/5 border border-fraja-gold/10 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-fraja-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 rounded-xl bg-fraja-gold/10 flex items-center justify-center relative z-10 shrink-0 shadow-inner">
            <Brain className="w-6 h-6 text-fraja-gold" />
          </div>
          <div className="flex-1 relative z-10">
             <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Active Analyzer</div>
             <div className="text-[12px] text-white font-black leading-none uppercase tracking-normal">FRAJA_INTELLIGENCE V5</div>
          </div>
        </div>

        <div className="bg-fraja-black p-5 rounded-2xl border border-fraja-border space-y-5 shadow-2xl">
          <div className="text-[11px] font-black text-fraja-gold tracking-[0.2em] uppercase italic border-b border-fraja-border/30 pb-3">Risk Protocol</div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Invalidation (%)</label>
              <input 
                type="number" 
                value={params.stopLoss}
                onChange={e => setParams({...params, stopLoss: Number(e.target.value)})}
                className="w-full bg-fraja-surface border border-fraja-border rounded-xl p-3 text-sm text-center text-white font-mono font-bold focus:outline-none focus:border-fraja-gold/50 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Target (%)</label>
              <input 
                type="number" 
                value={params.takeProfit}
                onChange={e => setParams({...params, takeProfit: Number(e.target.value)})}
                className="w-full bg-fraja-surface border border-fraja-border rounded-xl p-3 text-sm text-center text-white font-mono font-bold focus:outline-none focus:border-fraja-gold/50 transition-all shadow-inner"
              />
            </div>
          </div>
          <div className="space-y-2 border-t border-fraja-border/20 pt-4">
            <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Allocation Units</label>
            <input 
              type="number" 
              value={params.lotSize}
              onChange={e => setParams({...params, lotSize: Number(e.target.value)})}
              className="w-full bg-fraja-surface border border-fraja-border rounded-xl p-3 text-sm text-center text-white font-mono font-bold focus:outline-none focus:border-fraja-gold/50 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleAIAnalysis}
        disabled={analyzing}
        className="w-full bg-fraja-gold hover:bg-fraja-gold-bright text-fraja-black py-4 rounded-2xl text-xs font-black uppercase transition-all shadow-[0_0_30px_rgba(226,183,20,0.3)] active:scale-95 disabled:opacity-50 tracking-[0.1em]"
      >
        {analyzing ? "COMPUTING TACTICAL SETUP..." : "GENERATE FRAJA SIGNAL"}
      </button>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] flex gap-3 italic font-bold">
          <Shield className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {signal && (
        <div className={cn(
          "p-5 rounded-2xl border border-fraja-border transition-all bg-fraja-black relative shadow-2xl",
          signal.Signal === "BUY" ? "border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]" :
          signal.Signal === "SELL" ? "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : ""
        )}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-wider shadow-lg",
                signal.Signal === "BUY" ? "bg-green-600 text-white" :
                signal.Signal === "SELL" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"
              )}>{signal.Signal}</span>
              {signal.Analysis?.MacroTrend && (
                <span className={cn(
                  "text-[9px] font-black uppercase px-2 py-0.5 border rounded-md italic tracking-widest",
                  signal.Analysis.MacroTrend === "Bullish" ? "text-green-400 border-green-500/30" :
                  signal.Analysis.MacroTrend === "Bearish" ? "text-red-400 border-red-500/30" : "text-gray-500 border-gray-700"
                )}>
                  {signal.Analysis.MacroTrend} Trend
                </span>
              )}
            </div>
            <span className="text-[10px] text-fraja-gold font-mono font-black italic tracking-tighter bg-fraja-gold/10 px-2 py-0.5 rounded-md">{signal.Confidence}% S_ACC</span>
          </div>

          <div className="space-y-4 mb-5">
            <p className="text-[12px] leading-relaxed text-gray-300 font-medium italic break-words border-l-4 border-fraja-gold/40 pl-4 py-2 bg-white/5 rounded-r-xl shadow-inner shadow-black/20">
              "{signal.Reasoning}"
            </p>
            {signal.Analysis?.KeyLevel && (
              <div className="flex items-center gap-3 flex-wrap mt-3">
                <div className="flex items-center gap-2 min-w-fit">
                  <Target className="w-4 h-4 text-fraja-cyan shrink-0" />
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tactical Level:</span>
                </div>
                <span className="text-[11px] text-fraja-cyan font-black bg-fraja-cyan/10 px-3 py-1 rounded-lg border border-fraja-cyan/30 shadow-lg shadow-fraja-cyan/5">{signal.Analysis.KeyLevel}</span>
              </div>
            )}
            
            {signal.Analysis?.Sentiment && (
              <div className="flex items-start gap-3 mt-3">
                <TrendingUp className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Sentiment / COT</span>
                  <span className="text-[11px] text-purple-300 font-bold italic">{signal.Analysis.Sentiment}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-fraja-surface rounded-xl border border-fraja-border shadow-inner">
            <div className="space-y-1">
              <div className="text-[8px] uppercase text-gray-500 font-black tracking-widest leading-none">Stop Loss</div>
              <div className="text-[10px] font-mono text-red-500 font-black tracking-tighter leading-none">{signal.SL || "N/A"}</div>
            </div>
            <div className="space-y-1 border-l border-fraja-border pl-3">
              <div className="text-[8px] uppercase text-gray-500 font-black tracking-widest leading-none">Scalp TP</div>
              <div className="text-[10px] font-mono text-green-400 font-black tracking-tighter leading-none">{signal.ScalpTarget || signal.TP || "N/A"}</div>
            </div>
            <div className="space-y-1 border-l border-fraja-border pl-3">
              <div className="text-[8px] uppercase text-gray-500 font-black tracking-widest leading-none">Swing TP</div>
              <div className="text-[10px] font-mono text-green-500 font-black tracking-tighter leading-none">{signal.SwingTarget || signal.TP || "N/A"}</div>
            </div>
          </div>

          {signal.RiskReward && (
            <div className="mt-3 pt-3 border-t border-fraja-border flex justify-between items-center">
              <span className="text-[9px] text-gray-500 font-black italic tracking-[0.2em] uppercase opacity-50">REL_RIS_NODE</span>
              <span className="text-[12px] text-fraja-cyan font-mono font-black tracking-widest bg-fraja-cyan/5 px-3 py-1 rounded-lg border border-fraja-cyan/10">
                1:{signal.RiskReward.split(':')[1] || signal.RiskReward}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-2">
          {(['market', 'limit', 'trailing', 'oco'] as const).map((type) => (
            <button 
              key={type}
              onClick={() => handleTypeChange(type)}
              className={cn(
                "border py-2 text-[8px] font-black uppercase transition-all rounded tracking-tighter",
                orderType === type ? "bg-fraja-gold border-fraja-gold-bright text-fraja-black shadow-lg shadow-fraja-gold/20" : "bg-fraja-black border-fraja-border text-gray-500 hover:text-white"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {(orderType === 'limit' || orderType === 'oco') && (
          <div className="p-2.5 rounded border border-fraja-border bg-fraja-black animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-[8px] text-gray-500 uppercase font-bold block mb-1.5 tracking-widest">Entry Tactical Target</label>
            <div className="relative">
              <input 
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(Number(e.target.value))}
                className="w-full bg-fraja-surface border border-fraja-border rounded p-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-fraja-gold/50 transition-colors"
              />
              <div className="absolute right-2 top-1.5 text-[8px] font-bold text-gray-700 uppercase">USDT</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-fraja-border flex gap-3">
        <button 
          onClick={() => onMarketTrade?.('BUY')}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-[11px] font-black uppercase transition-all shadow-lg active:scale-95 flex flex-col items-center gap-1"
        >
          <span>{orderType === 'market' ? 'LONG_EXECUTE' : 'COMMIT_LONG'}</span>
          <span className="text-[7.5px] opacity-80 font-bold tracking-[0.2em] uppercase">Bullish Bias</span>
        </button>
        <button 
          onClick={() => onMarketTrade?.('SELL')}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-[11px] font-black uppercase transition-all shadow-lg active:scale-95 flex flex-col items-center gap-1"
        >
          <span>{orderType === 'market' ? 'SHORT_EXECUTE' : 'COMMIT_SHORT'}</span>
          <span className="text-[7.5px] opacity-80 font-bold tracking-[0.2em] uppercase">Bearish Bias</span>
        </button>
      </div>
    </div>
  );
}
