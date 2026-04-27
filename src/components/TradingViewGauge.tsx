import React, { useEffect, useRef } from 'react';

interface TradingViewGaugeProps {
  symbol: string;
}

export default function TradingViewGauge({ symbol }: TradingViewGaugeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic validation to avoid simple "Script error" from TradingView for clearly invalid symbols
    if (!containerRef.current || !symbol || symbol.length < 3) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    
    // Safety check for production: wrap in try-catch if possible, though scripts don't catch load errors easily
    script.onerror = () => {
      console.error(`[TV] Failed to load technical analysis for ${symbol}`);
      if (container) {
        container.innerHTML = `<div class="p-8 text-center text-gray-600 text-xs font-mono uppercase">
          Neural link failed for ${symbol}.<br/>Verify symbol on TradingView.
        </div>`;
      }
    };

    script.innerHTML = JSON.stringify({
      interval: '1h',
      width: '100%',
      isTransparent: true,
      height: 380,
      symbol: symbol,
      showIntervalTabs: true,
      locale: 'en',
      colorTheme: 'dark',
    });

    try {
      container.appendChild(script);
    } catch (e) {
      console.error("[TV] Widget Injection Error:", e);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol]);

  return <div ref={containerRef} className="h-full w-full flex items-center justify-center min-h-[380px]" />;
}
