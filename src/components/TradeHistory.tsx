import React from 'react';
import { History, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TradeHistory() {
  const mockTrades = [
    { id: 1, type: 'BUY', symbol: 'BTC/USDT', amount: '0.45', price: '64,120.50', status: 'COMPLETED', time: '2026-04-21 15:42', pnl: '+ $1,240.00' },
    { id: 2, type: 'SELL', symbol: 'ETH/USDT', amount: '12.50', price: '3,450.20', status: 'COMPLETED', time: '2026-04-21 14:15', pnl: '+ $420.15' },
    { id: 3, type: 'BUY', symbol: 'SOL/USDT', amount: '150.00', price: '142.10', status: 'CANCELLED', time: '2026-04-21 12:30', pnl: '--' },
    { id: 4, type: 'SELL', symbol: 'BNB/USDT', amount: '50.00', price: '585.40', status: 'COMPLETED', time: '2026-04-21 10:05', pnl: '- $85.50' },
    { id: 5, type: 'BUY', symbol: 'BTC/USDT', amount: '0.10', price: '63,500.00', status: 'COMPLETED', time: '2026-04-21 08:30', pnl: '+ $210.00' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] p-6 gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-blue-500" />
            Trade History
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-mono uppercase tracking-widest">Archive of your executed orders and performance metrics</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-[#161a1e] border border-[#2d333b] rounded px-3 py-1 items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search orders..." className="bg-transparent border-none outline-none text-sm text-gray-300 w-48" />
           </div>
           <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs transition-all uppercase tracking-widest">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Volume', value: '$1.42M', icon: Clock, color: 'text-blue-500' },
          { label: 'Win Rate', value: '72.4%', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Net Profit', value: '+$14,240.50', icon: TrendingDown, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#161a1e] border border-[#2d333b] p-4 rounded flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</div>
              <div className={cn("text-xl font-mono font-bold mt-1", stat.color)}>{stat.value}</div>
            </div>
            <stat.icon className={cn("w-8 h-8 opacity-20", stat.color)} />
          </div>
        ))}
      </div>

      <div className="flex-1 bg-[#161a1e] border border-[#2d333b] rounded overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 bg-[#1c2127] text-[10px] font-bold uppercase text-gray-500 p-4 border-b border-[#2d333b]">
          <div>Time</div>
          <div>Side</div>
          <div>Symbol</div>
          <div className="text-right">Size</div>
          <div className="text-right">Fill Price</div>
          <div className="text-right">P&L</div>
          <div className="text-right">Status</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockTrades.map((trade) => (
            <div key={trade.id} className="grid grid-cols-7 p-4 border-b border-[#2d333b]/50 hover:bg-white/5 transition-colors items-center font-mono text-[11px]">
              <div className="text-gray-500">{trade.time}</div>
              <div className={cn("font-bold", trade.type === 'BUY' ? 'text-green-500' : 'text-red-500')}>{trade.type}</div>
              <div className="text-white">{trade.symbol}</div>
              <div className="text-right text-gray-400">{trade.amount}</div>
              <div className="text-right text-gray-400">${trade.price}</div>
              <div className={cn("text-right font-bold", trade.pnl.includes('+') ? 'text-green-500' : 'text-red-500')}>{trade.pnl}</div>
              <div className="flex justify-end">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold",
                  trade.status === 'COMPLETED' ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-gray-500/10 text-gray-500 border border-gray-500/30"
                )}>
                  {trade.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
