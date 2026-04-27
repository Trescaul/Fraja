import React, { useState, useEffect } from 'react';
import { BrainCircuit, Activity, Zap, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getGeneralAnalysis } from '../lib/gemini';
import TradingViewGauge from './TradingViewGauge';

interface AIAnalyzerProps {
  symbol: string;
  price: number;
}

const getTVSymbol = (s: string) => {
  if (!s) return 'BINANCE:BTCUSDT';
  const symbol = s.replace('/', '').replace(' (OTC)', '').toUpperCase();
  if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOT', 'LTC', 'MATIC', 'LINK'].some(c => symbol.includes(c))) {
    if (symbol.includes(':')) return symbol;
    return `BINANCE:${symbol.endsWith('USDT') ? symbol : symbol + 'USDT'}`;
  }
  const majorForex = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'];
  if (majorForex.includes(symbol)) return `OANDA:${symbol}`;
  if (['XAUUSD', 'XAGUSD', 'GOLD', 'SILVER'].includes(symbol)) {
    const commMap: Record<string, string> = { 'GOLD': 'XAUUSD', 'SILVER': 'XAGUSD' };
    return `OANDA:${commMap[symbol] || symbol}`;
  }
  if (['SPX500', 'NAS100', 'US30'].includes(symbol)) return `FOREXCOM:${symbol}`;
  if (symbol.length <= 5 && !symbol.includes(':')) return `NASDAQ:${symbol}`;
  return symbol;
};

const analysisCache: Record<string, { text: any; confidence: number; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 15;

export default function AIAnalyzer({ symbol: initialSymbol, price: currentPrice }: AIAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<'AI' | 'TECH' | 'NEWS'>('AI');
  const [targetSymbol, setTargetSymbol] = useState(initialSymbol);
  const [analysis, setAnalysis] = useState<any>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fngData, setFngData] = useState<{ value: string; classification: string } | null>(null);

  useEffect(() => { setTargetSymbol(initialSymbol); }, [initialSymbol]);

  useEffect(() => {
    const fetchFNG = async () => {
      try {
        const res = await fetch('https://api.alternative.me/fng/');
        const data = await res.json();
        if (data?.data?.[0]) {
          setFngData({ value: data.data[0].value, classification: data.data[0].value_classification });
        }
      } catch (err) { console.warn("[FRAJA] FNG fetch failed:", err); }
    };
    fetchFNG();
  }, []);

  const performAnalysis = async (force: boolean = false) => {
    if (isAnalyzing || !targetSymbol) return;
    
    const cached = analysisCache[targetSymbol];
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setAnalysis(cached.text);
      setConfidence(cached.confidence);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const text = await getGeneralAnalysis(targetSymbol, currentPrice);
      // Logic: Mocking a confidence score. If your AI returns a JSON, parse it here.
      // For now, we simulate a score between 70-95
      const mockConfidence = Math.floor(Math.random() * (95 - 70 + 1) + 70); 
      
      analysisCache[targetSymbol] = { text, confidence: mockConfidence, timestamp: Date.now() };
      setAnalysis(text);
      setConfidence(mockConfidence);
    } catch (err: any) {
      setError("Tactical link failed. Check connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => performAnalysis(), 1500);
    return () => clearTimeout(timer);
  }, [initialSymbol]);

  return (
    <div className="bg-fraja-surface rounded-xl border border-fraja-border flex flex-col h-full overflow-hidden shadow-2xl relative">
      {/* ... [Keep your existing Header/Overlay code here] ... */}
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {analysis && !isAnalyzing && (
          <div className="space-y-6">
            {/* FNG Monitor */}
            {fngData && (
  <div>
    {/* Your FNG code goes here */}
  </div>
)}

            {/* RESTORED: Confidence Monitor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Neural Confidence</span>
                <span className="text-[10px] font-mono text-fraja-cyan font-bold">{confidence}%</span>
              </div>
              <div className="h-1 w-full bg-fraja-black rounded-full overflow-hidden border border-fraja-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-fraja-cyan shadow-[0_0_10px_rgba(0,223,255,0.5)]"
                />
              </div>
            </div>

            <div className="markdown-body prose prose-invert max-w-none">
              <Markdown>{analysis}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
