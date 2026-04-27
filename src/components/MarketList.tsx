import React, { useState } from 'react';
import { cn, formatPrice } from '../lib/utils';
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, Globe, Bitcoin, LineChart, BarChart3 } from 'lucide-react';

interface Market {
  symbol: string;
  price: number;
  type: string;
  status?: "LIVE" | "OTC" | "CLOSED";
}

function PriceDisplay({ price }: { price: number }) {
  const [prevPrice, setPrevPrice] = React.useState(price);
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);

  React.useEffect(() => {
    if (price > prevPrice) {
      setFlash("up");
      setTimeout(() => setFlash(null), 300);
    } else if (price < prevPrice) {
      setFlash("down");
      setTimeout(() => setFlash(null), 300);
    }
    setPrevPrice(price);
  }, [price, prevPrice]);

  return (
    <span className={cn(
      "transition-colors duration-300",
      flash === "up" ? "text-green-400 bg-green-500/10 px-1 rounded" : 
      flash === "down" ? "text-red-400 bg-red-500/10 px-1 rounded" : "text-gray-200"
    )}>
      {formatPrice(price)}
    </span>
  );
}

export default function MarketList({ 
  markets, 
  selectedSymbol, 
  onSelect 
}: { 
  markets: Market[], 
  selectedSymbol: string, 
  onSelect: (symbol: string) => void 
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (type: string) => {
    setCollapsed(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const types = ["forex", "crypto", "stock", "indices"];
  const grouped = types.reduce((acc, type) => {
    acc[type] = markets.filter(m => m.type === type);
    return acc;
  }, {} as Record<string, Market[]>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'forex': return <Globe className="w-3 h-3" />;
      case 'crypto': return <Bitcoin className="w-3 h-3" />;
      case 'stock': return <LineChart className="w-3 h-3" />;
      default: return <BarChart3 className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-[#161a1e] flex flex-col h-full font-mono overflow-y-auto custom-scrollbar">
      {types.map(type => (
        <div key={type} className="border-b border-[#2d333b]/50">
          <button 
            onClick={() => toggleCollapse(type)}
            className="w-full flex items-center justify-between p-3 bg-[#1c2127] hover:bg-[#20262d] transition-colors group"
          >
            <div className="flex items-center gap-2">
               <div className={cn(
                 "w-5 h-5 rounded flex items-center justify-center bg-gray-800 text-gray-400 group-hover:text-white transition-colors",
                 type === 'forex' && "text-blue-400",
                 type === 'crypto' && "text-orange-400"
               )}>
                 {getTypeIcon(type)}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">{type}</span>
               <span className="text-[9px] text-gray-600">({grouped[type]?.length || 0})</span>
            </div>
            {collapsed[type] ? <ChevronRight className="w-3 h-3 text-gray-600" /> : <ChevronDown className="w-3 h-3 text-gray-600" />}
          </button>
          
          {!collapsed[type] && (
            <div className="bg-[#0b0e11]/30">
               <table className="w-full text-left">
                  <tbody>
                    {grouped[type]?.map(market => {
                      const isSelected = selectedSymbol === market.symbol;
                      return (
                        <tr 
                          key={market.symbol}
                          onClick={() => onSelect(market.symbol)}
                          className={cn(
                            "cursor-pointer transition-colors border-b border-[#2d333b]/10 last:border-0",
                            isSelected ? "bg-[#20262d] border-l-2 border-l-blue-500" : "hover:bg-[#1c2127]"
                          )}
                        >
                          <td className="p-2 w-10">
                             <div className={cn("w-1 h-1 rounded-full", market.type === 'crypto' ? "bg-green-500" : "bg-blue-500")} />
                          </td>
                          <td className={cn("p-2 text-[11px] font-bold", isSelected ? "text-white" : "text-gray-300")}>
                            <div className="flex flex-col">
                              <span>{market.symbol}</span>
                              {market.status && (
                                <span className={cn(
                                  "text-[7px] font-bold px-1 rounded w-fit",
                                  market.status === 'LIVE' ? "bg-green-500/10 text-green-500" : 
                                  market.status === 'CLOSED' ? "bg-red-500/10 text-red-500" :
                                  "bg-orange-500/10 text-orange-400"
                                )}>
                                  {market.status}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-[11px] text-right font-mono">
                            <PriceDisplay price={market.price} />
                          </td>
                          <td className="p-2 text-[11px] text-right">
                            {Math.random() > 0.5 ? (
                              <span className="text-green-500 text-[9px]">+{(Math.random()*2).toFixed(2)}%</span>
                            ) : (
                              <span className="text-red-500 text-[9px]">-{(Math.random()*2).toFixed(2)}%</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
