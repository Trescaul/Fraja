import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface RealTimeChartProps {
  symbol: string;
  timeframe: string;
  isLoading: boolean;
  onSymbolChange: (s: string) => void;
  onTimeframeChange: (t: string) => void;
}

/**
 * Maps internal app symbols to TradingView symbols
 */
const getTVSymbol = (s: string) => {
  const symbol = s.replace('/', '').replace(' (OTC)', '').toUpperCase();
  // Crypto Mapping
  if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOT', 'LTC', 'MATIC', 'LINK', 'PEPE', 'DOGE', 'SHIB'].some(c => symbol.includes(c))) {
    return `BINANCE:${symbol.endsWith('USDT') ? symbol : symbol + 'USDT'}`;
  }
  // Forex Mapping
  if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURGBP', 'EURJPY'].includes(symbol)) {
    return `OANDA:${symbol}`;
  }
  // Metals
  if (['XAUUSD', 'XAGUSD', 'GOLD', 'SILVER'].includes(symbol)) {
    if (symbol === 'GOLD') return 'OANDA:XAUUSD';
    if (symbol === 'SILVER') return 'OANDA:XAGUSD';
    return `OANDA:${symbol}`;
  }
  // Indices
  if (['SPX500', 'NAS100', 'US30', 'GER40', 'UK100'].includes(symbol)) {
    return `FOREXCOM:${symbol}`;
  }
  return symbol;
};

export default function RealTimeChart({ 
  symbol, 
  timeframe, 
  isLoading,
  onSymbolChange,
  onTimeframeChange
}: RealTimeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    let tvWidget: any = null;

    const initWidget = () => {
      try {
        if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
          // Create a unique container for this instance to avoid ID collisions
          const containerId = `tv_chart_${Math.random().toString(36).substring(7)}`;
          containerRef.current.innerHTML = `<div id="${containerId}" style="height: 100%; width: 100%;"></div>`;

          tvWidget = new (window as any).TradingView.widget({
            "autosize": true,
            "symbol": getTVSymbol(symbol),
            "interval": timeframe.includes('h') ? timeframe.replace('h', '') : (timeframe === 'd' ? 'D' : timeframe.replace('m', '')),
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#161a1e",
            "enable_publishing": false,
            "hide_side_toolbar": false,
            "allow_symbol_change": true,
            "container_id": containerId,
            "backgroundColor": "#0b0e11",
            "gridColor": "rgba(42, 46, 57, 0.06)",
            "withdateranges": true,
            "hide_top_toolbar": false,
            "save_image": false,
          });
        }
      } catch (err) {
        console.error("[FRAJA] TradingView Widget Init Failed:", err);
      }
    };

    if (!(window as any).TradingView) {
      script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = initWidget;
      script.onerror = () => {
        console.error("[FRAJA] TradingView Script Load Failed");
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="flex items-center justify-center h-full text-red-500 font-mono text-[10px]">NETWORK_FAILURE: TV_LIB_UNREACHABLE</div>`;
        }
      };
      document.head.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      if (tvWidget) {
        try {
          // Some versions of the widget have a remove or destroy method
          if (typeof tvWidget.remove === 'function') tvWidget.remove();
        } catch (e) {
          // Ignore
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, timeframe]);

  return (
    <div className="w-full h-full bg-fraja-black flex flex-col overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-fraja-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
           <div className="w-10 h-10 border-2 border-fraja-gold border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(226,183,20,0.5)]"></div>
           <span className="text-[10px] text-fraja-gold font-black animate-pulse uppercase tracking-[0.4em] italic">Authenticating Fraja Node...</span>
        </div>
      )}
      
      {/* TradingView Container */}
      <div 
        id="tradingview_advanced_chart" 
        ref={containerRef}
        className="flex-1 w-full h-full"
      />
      
      {/* Terminal Overlay for that professional branding */}
      <div className="absolute bottom-6 left-6 pointer-events-none opacity-40">
        <div className="flex flex-col">
          <span className="text-[12px] font-black text-fraja-gold tracking-[0.4em] uppercase italic">FRAJA_INTELLIGENCE</span>
          <span className="text-[8px] text-gray-500 font-mono font-bold">NODE_SYNC_ACTIVE // PRECISION_MODE_ENTERED</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none">
         <div className="flex items-center gap-2 px-3 py-1 bg-fraja-gold text-fraja-black text-[9px] font-black italic rounded-full uppercase tracking-widest shadow-lg shadow-fraja-gold/20">
            <span className="w-1.5 h-1.5 bg-fraja-black rounded-full animate-pulse" />
            LIVE_DATA_STREAM
         </div>
      </div>
    </div>
  );
}
