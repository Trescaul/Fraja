import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

const newsData: NewsItem[] = [
  { id: '1', title: 'Bitcoin surges past $65k as institutional interest peaks', source: 'REUTERS', sentiment: 'positive' },
  { id: '2', title: 'Ethereum network upgrade scheduled for next month', source: 'COINDESK', sentiment: 'neutral' },
  { id: '3', title: 'SEC delays decision on spot ETF applications', source: 'BLOOMBERG', sentiment: 'negative' },
  { id: '4', title: 'Solana ecosystem marks 200% growth in TVL', source: 'DECRYPT', sentiment: 'positive' },
  { id: '5', title: 'Global central banks discuss digital currency frameworks', source: 'FT', sentiment: 'neutral' },
  { id: '6', title: 'Market liquidity shifts towards decentralized exchanges', source: 'THE BLOCK', sentiment: 'positive' },
  { id: '7', title: 'New regulatory framework proposed for stablecoins', source: 'CNBC', sentiment: 'negative' },
];

export const NewsTicker: React.FC = () => {
  return (
    <div className="h-8 bg-[#161a1e] border-t border-[#2d333b] flex items-center overflow-hidden whitespace-nowrap relative shrink-0 z-50">
      <div className="flex items-center px-4 bg-[#161a1e] border-r border-[#2d333b] z-20 h-full gap-2 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
        <Newspaper className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">CORTEX_LIVE</span>
      </div>
      
      <div className="relative flex-1 overflow-hidden h-full">
        <motion.div 
          className="flex gap-16 items-center px-6 absolute left-0 top-0 bottom-0"
          animate={{
            x: ["-50%", "0%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {/* Double the items to create a seamless loop */}
          {[...newsData, ...newsData].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                {item.sentiment === 'positive' && <TrendingUp className="w-3 h-3 text-green-500" />}
                {item.sentiment === 'negative' && <TrendingDown className="w-3 h-3 text-red-500" />}
                {item.sentiment === 'neutral' && <AlertCircle className="w-3 h-3 text-blue-500" />}
                <span className="text-[10px] text-gray-500 font-mono font-bold tracking-tighter uppercase">
                  {item.source}
                </span>
              </div>
              <span className="text-[11px] text-gray-300 font-medium tracking-tight">
                {item.title.toUpperCase()}
              </span>
              <div className="w-1 h-1 rounded-full bg-gray-700 mx-2" />
            </div>
          ))}
        </motion.div>
      </div>
      
      <div className="px-4 bg-[#161a1e] border-l border-[#2d333b] z-20 h-full flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">DATA_SYNC_OK</span>
      </div>
    </div>
  );
};
