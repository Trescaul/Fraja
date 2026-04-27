import React, { useState } from 'react';
import { LineChart, Play, Settings2, BarChart3, Target, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Backtesting() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const runSimulation = () => {
    setIsRunning(true);
    setHasResults(false);
    setTimeout(() => {
      setIsRunning(false);
      setHasResults(true);
    }, 2500);
  };

  return (
    <div className="flex h-full bg-[#0b0e11] text-[#e0e3e7] p-6 gap-6 overflow-hidden">
      {/* Left Config Panel */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-[#161a1e] border border-[#2d333b] rounded p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Settings2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Strategy Config</h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Algorithm</label>
            <select className="bg-[#0b0e11] border border-[#2d333b] rounded p-2 text-xs text-white outline-none">
              <option>RSI_Mean_Reversion</option>
              <option>MACD_Trend_Follower</option>
              <option>Bollinger_Breakout</option>
              <option>Gemini_AI_Adaptive</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Input Asset</label>
            <select className="bg-[#0b0e11] border border-[#2d333b] rounded p-2 text-xs text-white outline-none">
              <option>BTC/USDT</option>
              <option>ETH/USDT</option>
              <option>SOL/USDT</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Start Date</label>
                <div className="relative">
                   <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                   <input type="date" defaultValue="2026-01-01" className="bg-[#0b0e11] border border-[#2d333b] rounded p-2 pl-7 text-[10px] text-white outline-none w-full" />
                </div>
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase">End Date</label>
                <div className="relative">
                   <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                   <input type="date" defaultValue="2026-04-21" className="bg-[#0b0e11] border border-[#2d333b] rounded p-2 pl-7 text-[10px] text-white outline-none w-full" />
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Initial Capital ($)</label>
            <input type="number" defaultValue="50000" className="bg-[#0b0e11] border border-[#2d333b] rounded p-2 text-xs text-white outline-none focus:border-blue-500" />
          </div>

          <button 
            onClick={runSimulation}
            disabled={isRunning}
            className={cn(
              "mt-4 py-3 rounded font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
              isRunning ? "bg-red-500/10 text-red-500 border border-red-500/30" : "bg-blue-600 text-white"
            )}
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Backtest
              </>
            )}
          </button>
        </div>

        <div className="bg-blue-600/5 border border-blue-600/20 rounded p-4">
           <h3 className="text-[10px] font-bold text-blue-500 uppercase mb-2">Backtest Tip</h3>
           <p className="text-[10px] text-gray-400 leading-relaxed">
             AI simulations use real historical tickers. For Gemini_AI_Adaptive, we also compute order book slippage and trading fees (0.1%).
           </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
         {/* Results Overview */}
         <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Cumulative Return', value: hasResults ? '+24.5%' : (isRunning ? '---' : '0.00%'), icon: BarChart3, color: 'text-green-400' },
              { label: 'Max Drawdown', value: hasResults ? '-4.2%' : (isRunning ? '---' : '0.00%'), icon: TrendingUp, color: 'text-red-400' },
              { label: 'Sharpe Ratio', value: hasResults ? '1.85' : (isRunning ? '---' : '0.00'), icon: Target, color: 'text-purple-400' },
              { label: 'Total Trades', value: hasResults ? '124' : (isRunning ? '---' : '0'), icon: Play, color: 'text-blue-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#161a1e] border border-[#2d333b] p-4 rounded group hover:border-[#374151] transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div className={cn("text-xl font-mono font-bold mt-2", stat.color)}>{stat.value}</div>
              </div>
            ))}
         </div>

         {/* Equity Curve Chart Placeholder */}
         <div className="flex-1 bg-[#161a1e] border border-[#2d333b] rounded p-6 flex flex-col gap-4 relative min-h-[400px]">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <LineChart className="w-5 h-5 text-blue-500" />
               <span className="text-sm font-bold text-white uppercase tracking-wider">Equity Curve Simulation</span>
             </div>
             <div className="flex gap-2">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-0.5 bg-blue-500"></div>
                   <span className="text-[10px] text-gray-500 uppercase">Growth</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                   <div className="w-3 h-0.5 bg-red-400"></div>
                   <span className="text-[10px] text-gray-500 uppercase">Drawdown</span>
                </div>
             </div>
           </div>

           <div className="flex-1 border-b border-l border-gray-800 relative">
              {isRunning ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0b0e11]/50 z-10">
                   <div className="text-blue-500 text-xs font-mono animate-pulse uppercase tracking-[0.3em]">Processing Tickers...</div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <LineChart className="w-48 h-48" />
                </div>
              )}
              {/* This is a visual representation of the grid */}
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-6">
                 {Array.from({length: 60}).map((_, i) => (
                   <div key={i} className="border-t border-r border-gray-800/20"></div>
                 ))}
              </div>

              {/* Mock Curve Path */}
              {hasResults && (
                <svg className="absolute inset-0 w-full h-full p-4 overflow-visible">
                   <polyline
                     points="0,300 50,280 100,290 150,250 200,260 250,220 300,230 400,180 500,150 600,160 700,120 800,100"
                     fill="none"
                     stroke="#3b82f6"
                     strokeWidth="3"
                     strokeLinecap="round"
                     className="animate-[draw_2s_ease-out_forwards]"
                     style={{
                        strokeDasharray: '2000',
                        strokeDashoffset: '2000',
                     }}
                   />
                </svg>
              )}
           </div>
         </div>
      </div>
    </div>
  );
}
