import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Box } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

export default function PortfolioStats({ 
  equity = 10000, 
  available = 10000, 
  todayPnL = 0,
  tradesCount = 0
}: { 
  equity?: number, 
  available?: number, 
  todayPnL?: number,
  tradesCount?: number
}) {
  const stats = [
    { label: "Account Equity", value: equity, icon: DollarSign, trend: todayPnL >= 0 ? `+${((todayPnL/equity)*100).toFixed(2)}%` : `${((todayPnL/equity)*100).toFixed(2)}%` },
    { label: "Available Cash", value: available, icon: Activity, trend: `${((available/equity)*100).toFixed(1)}% Free` },
    { label: "Total P&L", value: todayPnL, icon: todayPnL >= 0 ? TrendingUp : TrendingDown, trend: todayPnL >= 0 ? "PROFIT" : "LOSS", highlight: true },
    { label: "Open Positions", value: tradesCount, icon: Box, trend: `Live Markets` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-b border-fraja-border">
      {stats.map((stat, i) => (
        <div key={i} className="p-4 border-r border-fraja-border last:border-r-0 bg-fraja-surface hover:bg-fraja-black transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-2 -translate-y-2 group-hover:opacity-20 transition-opacity">
            <stat.icon className="w-12 h-12 text-fraja-gold" />
          </div>
          <div className="flex items-center gap-2 mb-1 relative z-10">
            <stat.icon className="w-3 h-3 text-gray-500 group-hover:text-fraja-gold transition-colors" />
            <span className="font-sans text-[9px] uppercase font-bold text-gray-500 tracking-widest group-hover:text-gray-300">{stat.label}</span>
          </div>
          <div className="flex items-baseline justify-between relative z-10">
            <span className="font-mono text-xl font-bold text-white tracking-tighter">
              {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
            </span>
            <span className={cn(
              "text-[10px] font-black italic tracking-tighter",
              stat.highlight ? (todayPnL >= 0 ? "text-green-500" : "text-red-500") : "text-fraja-cyan/50"
            )}>
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
