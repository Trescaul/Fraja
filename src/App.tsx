import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { LineChart, LayoutDashboard, History, Settings, Bell, User, BookOpen, ShieldAlert, LogOut, X, Brain, Globe, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn, formatCurrency, formatPrice } from './lib/utils';
import RealTimeChart from './components/RealTimeChart';
import TradingPanel from './components/TradingPanel';
import PortfolioStats from './components/PortfolioStats';
import MarketList from './components/MarketList';
import Academy from './components/Academy';
import TradeHistory from './components/TradeHistory';
import Backtesting from './components/Backtesting';
import AIAnalyzer from './components/AIAnalyzer';
import { NewsTicker } from './components/NewsTicker';
import { useAuth } from './components/Auth';
import ForexClock from './components/ForexClock';

import IntroSequence from './components/IntroSequence';

const socket = io();

export default function App() {
  const { user, logout } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [markets, setMarkets] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [candles, setCandles] = useState<any[]>([]);
  const [view, setView] = useState("chart");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(420); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const [timeframe, setTimeframe] = useState("1m");
  const [isLoading, setIsLoading] = useState(false);
  const [tradeLogs, setTradeLogs] = useState<string[]>([]);
  const [wallet, setWallet] = useState({ balance: 10000, totalProfit: 0, trades: [] as any[] });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleIntroComplete = React.useCallback(() => {
    setShowIntro(false);
  }, []);

  // Handle sidebar resizing
  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 320 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const activeTrades = wallet.trades;

  const addLog = (msg: string) => {
    setTradeLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleTrade = (type: 'BUY' | 'SELL', price: number, strategy: string = "Manual Execution") => {
    const margin = 500; // Fixed margin for demo/test
    if (wallet.balance < margin) {
      addLog(`[ERROR] Insufficient margin for ${type} order. Please check balance or deposit funds.`);
      return;
    }

    const newTrade = {
      id: Date.now(),
      name: strategy,
      entry: price,
      market: price,
      pnl: 0,
      type,
      margin
    };
    
    setWallet(prev => ({ 
      ...prev, 
      balance: prev.balance - margin,
      trades: [newTrade, ...prev.trades].slice(0, 10)
    }));
    addLog(`[SUCCESS] ${type} order filled at ${price.toFixed(2)} (PRACTICE)`);
  };

  const closeTrade = (tradeId: number) => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (trade) {
      const realizedPnL = trade.pnl;
      addLog(`[EXIT] Closed ${trade.name} ${trade.type} at ${trade.market.toFixed(2)} (Net: ${realizedPnL.toFixed(2)})`);
      
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + trade.margin + realizedPnL,
        totalProfit: prev.totalProfit + realizedPnL,
        trades: prev.trades.filter(t => t.id !== tradeId)
      }));
    }
  };

  const closeAllTrades = () => {
    if (activeTrades.length === 0) return;
    
    const totalPnL = activeTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalMargin = activeTrades.reduce((sum, t) => sum + t.margin, 0);
    
    addLog(`[EXIT] Closing all ${activeTrades.length} positions. Total realized: ${totalPnL.toFixed(2)}`);
    
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + totalMargin + totalPnL,
      totalProfit: prev.totalProfit + totalPnL,
      trades: []
    }));
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/history?symbol=${encodeURIComponent(selectedSymbol)}&interval=${timeframe}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((c: any) => ({
            ...c,
            time: new Date(c.time)
          }));
          setCandles(formatted);
        }
      } catch (e) {
        console.warn("[FRAJA] History fetch failed, assuming offline mode or blocked request:", e);
        // Fallback simulated data so the UI doesn't break
        const mockData = Array.from({ length: 50 }).map((_, i) => ({
          time: new Date(Date.now() - (50 - i) * 60000),
          open: 100, high: 101, low: 99, close: 100
        }));
        setCandles(mockData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
    setCandles([]);
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    const handleMarketUpdate = (updateData: any) => {
      if (!Array.isArray(updateData)) return;
      
      setMarkets(updateData);
      const active = updateData.find((m: any) => m.symbol === selectedSymbol);
      
      if (active && typeof active.price === 'number' && active.price > 0) {
        setCandles(prev => {
          if (prev.length === 0) return [];
          const now = new Date();
          const lastCandle = prev[prev.length - 1];
          const isSameMinute = lastCandle && 
            new Date(lastCandle.time).getMinutes() === now.getMinutes() &&
            new Date(lastCandle.time).getHours() === now.getHours();

          let newCandles = [];
          if (isSameMinute) {
            const updated = [...prev];
            const candle = { ...updated[updated.length - 1] };
            candle.close = active.price;
            candle.high = Math.max(candle.high, active.price);
            candle.low = Math.min(candle.low, active.price);
            updated[updated.length - 1] = candle;
            newCandles = updated;
          } else {
            const newCandle = {
              time: now,
              open: active.price,
              high: active.price,
              low: active.price,
              close: active.price,
            };
            newCandles = [...prev, newCandle].slice(-1000);
          }

          return newCandles;
        });

        // Update trade P&L (Active Context) separately to avoid nested state updates
        setWallet(prevW => ({
          ...prevW,
          trades: prevW.trades.map((t: any) => {
            const diff = active.price - t.entry;
            const pnl = t.type === 'BUY' ? diff : -diff;
            return { ...t, market: active.price, pnl };
          })
        }));
      }
    };

    socket.on("marketUpdate", handleMarketUpdate);

    return () => {
      socket.off("marketUpdate", handleMarketUpdate);
    };
  }, [selectedSymbol]);

  const normalizeSymbol = (s: string) => s.replace('/', '').toUpperCase();
  const activeMarket = markets.find(m => normalizeSymbol(m.symbol) === normalizeSymbol(selectedSymbol)) || { price: 0, status: 'OFFLINE' };
  const unrealizedPnL = activeTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalEquity = wallet.balance + activeTrades.reduce((sum, t) => sum + t.margin, 0) + unrealizedPnL;

  return (
    <div className="h-screen flex flex-col bg-fraja-black text-[#e0e3e7] overflow-hidden font-sans selection:bg-fraja-cyan/30">
      <AnimatePresence>
        {showIntro && <IntroSequence key="intro" onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* PROFESSIONAL TERMINAL HEADER: High-Density HUD */}
      <header className="h-14 border-b border-fraja-border flex items-center px-4 justify-between bg-fraja-surface shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fraja-gold to-fraja-cyan flex items-center justify-center shadow-lg shadow-fraja-gold/20 relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
               <img 
                 src="/logo.png" 
                 className="w-full h-full object-contain relative z-10"
                 onError={(e) => {
                   e.currentTarget.style.display = 'none';
                   const fallback = e.currentTarget.parentElement?.querySelector('.header-logo-fallback');
                   if (fallback) fallback.classList.remove('hidden');
                 }}
               />
               <span className="header-logo-fallback hidden font-black text-xl text-fraja-black italic relative z-10">F</span>
             </div>
             <div className="flex flex-col">
               <span className="font-black text-sm tracking-tighter uppercase text-white leading-none">FRAJA<span className="text-fraja-gold"> INTELLIGENCE</span></span>
               <span className="text-[10px] text-fraja-gold/80 font-bold tracking-[0.2em] leading-none mt-1 uppercase italic">Precision Meets Profit</span>
             </div>
          </div>
          
          <div className="h-10 w-px bg-fraja-border" />
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-fraja-border shadow-inner group focus-within:border-fraja-gold/50 transition-all">
            <Search className="w-3.5 h-3.5 text-gray-500 group-focus-within:text-fraja-gold transition-colors" />
            <input 
              type="text"
              placeholder="Search Asset (e.g. BTCUSD)..."
              className="bg-transparent border-none outline-none text-[11px] font-mono font-bold text-white w-40 placeholder:text-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.toUpperCase().trim();
                  if (val) {
                    // Try to format nicely (e.g. BTCUSD -> BTC/USDT if it matches a known pair)
                    let formatted = val;
                    if (val.length === 6 && !val.includes('/')) {
                       formatted = `${val.substring(0, 3)}/${val.substring(3)}`;
                    } else if (val.endsWith('USDT') && !val.includes('/')) {
                       formatted = `${val.replace('USDT', '')}/USDT`;
                    }
                    setSelectedSymbol(formatted);
                    e.currentTarget.value = '';
                    addLog(`[SYSTEM] Retargeting execution node to ${formatted}...`);
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Total Equity</span>
            <span className="text-sm font-mono font-bold text-fraja-gold leading-none">
              {formatCurrency(totalEquity)}
            </span>
          </div>
          <div className="h-10 w-px bg-fraja-border" />
          <div className="flex items-center gap-3 pl-2">
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className={cn(
                  "relative group p-2 rounded-lg transition-all",
                  isNotificationsOpen ? "bg-fraja-gold/20 text-white" : "hover:bg-fraja-surface text-gray-400"
                )}
              >
                <Bell className="w-4 h-4 transition-colors" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-fraja-gold rounded-full border-2 border-fraja-surface" />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    key="notifications"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-fraja-surface border border-fraja-border rounded-xl shadow-2xl z-[100] overflow-hidden"
                  >
                    <div className="p-4 border-b border-fraja-border bg-fraja-black flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest text-fraja-gold">Execution Logs</span>
                      <button onClick={() => setTradeLogs([])} className="text-[9px] text-fraja-gold hover:text-fraja-gold-bright font-bold uppercase">Clear All</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {tradeLogs.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell className="w-8 h-8 text-fraja-gold/20 mx-auto mb-2" />
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">No Recent Signals</p>
                        </div>
                      ) : (
                        tradeLogs.map((log, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-fraja-black border border-fraja-border/50 flex flex-col gap-1">
                            <span className="text-[10px] text-white leading-relaxed font-mono">{log}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className={cn(
                  "w-9 h-9 rounded-xl border overflow-hidden shadow-inner flex items-center justify-center transition-all",
                  isProfileOpen ? "bg-fraja-gold border-fraja-gold-bright" : "bg-fraja-border border-fraja-border"
                )}
              >
                 <User className={cn("w-5 h-5", isProfileOpen ? "text-fraja-black" : "text-gray-400")} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-fraja-surface border border-fraja-border rounded-xl shadow-2xl z-[100] overflow-hidden"
                  >
                    <div className="p-6 bg-gradient-to-br from-fraja-gold/20 to-fraja-cyan/20 border-b border-fraja-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-fraja-gold flex items-center justify-center shadow-lg shadow-fraja-gold/30">
                          <User className="w-6 h-6 text-fraja-black" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white leading-tight">{user?.email?.split('@')[0] || 'Trader_Alpha'}</span>
                          <span className="text-[9px] text-fraja-gold font-bold uppercase tracking-widest">Master Executioner</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div className="flex flex-col gap-1 px-2">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total Account Balance</span>
                        <span className="text-xl font-mono font-bold text-white tracking-tighter">{formatCurrency(wallet.balance)}</span>
                      </div>
                      
                      <div className="h-px bg-fraja-border mx-2" />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button className="p-2 rounded-lg bg-fraja-border hover:bg-gray-700 text-[10px] font-bold text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                          <Settings className="w-3 h-3" />
                          Account
                        </button>
                        <button 
                          onClick={logout}
                          className="p-2 rounded-lg bg-red-600/10 hover:bg-red-600 text-[10px] font-bold text-red-500 hover:text-white uppercase tracking-widest transition-all border border-red-500/20 flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-3 h-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* SIDE NAVIGATION BAR */}
        <div className="w-[64px] border-r border-fraja-border bg-fraja-black flex flex-col items-center py-6 gap-6 shrink-0 shadow-2xl z-50">
          {[
            { icon: LineChart, id: 'chart', label: 'Terminal Chart' },
            { icon: Brain, id: 'intelligence', label: 'AI Intelligence' },
            { icon: BookOpen, id: 'academy', label: 'Forex Academy' },
            { icon: LayoutDashboard, id: 'blotter', label: 'Trade Blotter' },
            { icon: History, id: 'history', label: 'Ledger History' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setView(item.id)}
              className={cn(
                "p-3.5 rounded-2xl transition-all group relative border",
                view === item.id 
                  ? "bg-fraja-gold border-fraja-gold-bright text-fraja-black shadow-[0_0_15px_rgba(226,183,20,0.4)]" 
                  : "bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-fraja-surface"
              )}
            >
              <item.icon className="w-5 h-5" />
              <div className="absolute left-[75px] px-3 py-1.5 bg-fraja-surface border border-fraja-border text-[10px] font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none z-[100] shadow-2xl uppercase tracking-widest">
                {item.label}
              </div>
              {view === item.id && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-fraja-gold/10 blur-xl rounded-full" 
                />
              )}
            </button>
          ))}
          
          <div className="mt-auto flex flex-col gap-6 items-center">
             <div className="h-px w-8 bg-fraja-border" />
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className={cn(
                 "p-3 rounded-xl transition-all group relative",
                 isSettingsOpen ? "bg-fraja-gold text-fraja-black shadow-lg shadow-fraja-gold/20" : "text-gray-600 hover:text-white"
               )}
             >
               <Settings className="w-5 h-5" />
               <div className="absolute left-[75px] px-3 py-1.5 bg-fraja-surface border border-fraja-border text-[10px] font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none z-[100] shadow-2xl uppercase tracking-widest">
                 System Settings
               </div>
             </button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 flex flex-col overflow-hidden bg-fraja-black">
          
          {/* PERSISTENT CONTEXT BAR */}
          <div className="h-14 bg-fraja-surface border-b border-fraja-border px-6 flex items-center justify-between shadow-sm z-40">
             <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  {/* Symbol header removed as requested */}
                </div>
             </div>

             <div className="flex items-center gap-6">
                <div className="flex flex-col items-end pr-4 border-r border-fraja-border">
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-0.5">Connectivity</span>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-fraja-cyan animate-pulse shadow-[0_0_8px_rgba(0,223,255,0.6)]" />
                     <span className="text-[10px] font-mono text-gray-400">DATA_LINK_STABLE</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                      isSidebarOpen ? "bg-fraja-gold/10 border-fraja-gold/30 text-fraja-gold" : "bg-fraja-surface border-fraja-border text-gray-500 hover:text-white"
                    )}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Execution</span>
                  </button>
                  <ForexClock />
                </div>
             </div>
          </div>

          {/* DYNAMIC MODULE VIEWPORT */}
          <div className="flex-1 overflow-hidden relative">
            {/* PERSISTED CHART VIEW */}
            <div 
              className={cn(
                "absolute inset-0 flex transition-all duration-500 ease-in-out",
                view === 'chart' ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[0.98] pointer-events-none z-0"
              )}
            >
              <div className="flex-1 flex flex-col order-first lg:order-none min-w-0">
                <div className="flex-1 bg-black">
                  <RealTimeChart 
                    symbol={selectedSymbol} 
                    timeframe={timeframe}
                    isLoading={isLoading}
                    onSymbolChange={setSelectedSymbol}
                    onTimeframeChange={setTimeframe}
                  />
                </div>
              </div>

               {/* EXECUTION PANEL (LOGIC DUPLICATED OR PERSISTED) */}
               <AnimatePresence mode="popLayout">
                  {isSidebarOpen && view === 'chart' && (
                    <motion.div 
                      key="execution-panel"
                      initial={{ x: sidebarWidth, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: sidebarWidth, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      style={{ width: sidebarWidth }}
                      className="hidden lg:flex bg-[#161a1e] border-l border-[#2d333b] flex-col shadow-2xl relative h-full z-[45]"
                    >
                        <div 
                          onMouseDown={startResizing}
                          className={cn(
                            "absolute left-0 top-0 w-1 h-full cursor-col-resize z-50 transition-colors",
                            isResizing ? "bg-fraja-gold shadow-[0_0_10px_#e2b714]" : "hover:bg-fraja-gold/30"
                          )}
                        />
                        <div className="p-5 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                           <div className="mb-6 p-5 rounded-xl bg-blue-600/5 border border-blue-500/10">
                              <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">Exchange Status</span>
                              </div>
                              <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">
                                Verified connectivity via Tier-1 liquidity providers. Execution guaranteed within 50ms.
                              </p>
                           </div>
                           <TradingPanel 
                             symbol={selectedSymbol} 
                             currentPrice={activeMarket.price}
                             candles={candles}
                             onMarketTrade={(type) => handleTrade(type, activeMarket.price)}
                           />
                           <div className="mt-8">
                              <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Positions</span>
                                <span className="text-[10px] font-mono text-gray-600">[{activeTrades.length}]</span>
                              </div>
                              <div className="space-y-2">
                                {activeTrades.slice(0, 3).map(trade => (
                                  <div key={trade.id} className="p-3 rounded-lg bg-[#0b0e11] border border-[#2d333b] flex justify-between items-center">
                                     <div className="flex flex-col">
                                       <span className={cn("text-[8px] font-bold px-1 rounded-sm w-fit mb-0.5", trade.type === 'BUY' ? "bg-green-500 text-black" : "bg-red-500 text-white")}>{trade.type}</span>
                                       <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{selectedSymbol}</span>
                                     </div>
                                     <span className={cn("text-xs font-mono font-bold", trade.pnl >= 0 ? "text-green-500" : "text-red-500")}>
                                       {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                     </span>
                                  </div>
                                ))}
                              </div>
                           </div>
                        </div>
                        <div className="p-4 bg-[#1c2127] border-t border-[#2d333b]">
                           <button 
                             onClick={() => setView('blotter')}
                             className="w-full py-2.5 rounded-xl border border-[#2d333b] hover:bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-all"
                           >
                              Open Full Blotter
                           </button>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
               {view === 'intelligence' && (
                 <motion.div 
                   key="analysis-view"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="absolute inset-0 p-4"
                 >
                    <div className="h-full bg-[#161a1e] rounded-3xl border border-[#2d333b] shadow-2xl overflow-hidden flex flex-col">
                       <AIAnalyzer symbol={selectedSymbol} price={activeMarket.price} />
                    </div>
                 </motion.div>
               )}

               {view === 'academy' && (
                 <motion.div 
                   key="academy-view"
                   initial={{ opacity: 0, x: 50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -50 }}
                   className="absolute inset-0 p-4"
                 >
                    <Academy />
                 </motion.div>
               )}

               {view === 'blotter' && (
                 <motion.div 
                   key="blotter-view"
                   initial={{ opacity: 0, scale: 1.05 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="absolute inset-0 p-8 flex flex-col"
                 >
                    <div className="flex-1 bg-[#161a1e] rounded-3xl border border-[#2d333b] shadow-2xl flex flex-col overflow-hidden">
                       <div className="p-6 border-b border-[#2d333b] bg-[#1c2127] flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                               <LayoutDashboard className="w-5 h-5 text-blue-400" />
                             </div>
                             <div>
                               <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Execution Blotter</h2>
                               <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1 opacity-50">Real-time Trade Management Node</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="flex flex-col items-end">
                               <span className="text-[10px] text-gray-600 font-bold uppercase mb-1">Open Unrealized P/L</span>
                               <span className={cn("text-lg font-mono font-bold", unrealizedPnL >= 0 ? "text-green-500" : "text-red-500")}>
                                 {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toFixed(2)} USD
                               </span>
                             </div>
                             <div className="h-10 w-px bg-gray-800" />
                             <button 
                               onClick={closeAllTrades}
                               disabled={activeTrades.length === 0}
                               className="px-5 py-2 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-bold border border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                             >
                                Close All Positions
                             </button>
                          </div>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                          <PortfolioStats 
                            equity={totalEquity}
                            todayPnL={unrealizedPnL}
                            tradesCount={activeTrades.length}
                          />
                       </div>
                    </div>
                 </motion.div>
               )}

               {view === 'history' && (
                 <motion.div 
                   key="history-view"
                   initial={{ opacity: 0, rotateX: 20 }}
                   animate={{ opacity: 1, rotateX: 0 }}
                   exit={{ opacity: 0, rotateX: -20 }}
                   className="absolute inset-0 p-12 flex flex-col items-center justify-center"
                 >
                    <div className="max-w-2xl w-full p-12 rounded-3xl bg-[#161a1e] border border-[#2d333b] text-center space-y-8 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
                       <div className="w-24 h-24 rounded-[32px] bg-gray-800/50 flex items-center justify-center mx-auto border border-gray-700 shadow-inner">
                          <History className="w-12 h-12 text-gray-600" />
                       </div>
                       <div className="space-y-4">
                          <h2 className="text-3xl font-bold text-white uppercase tracking-[0.3em]">Institutional Ledger</h2>
                          <p className="text-gray-500 uppercase font-bold tracking-widest text-xs leading-loose">
                            Historical transaction logs for this session have been stored on the terminal core. Full clearance reports will be generated upon market close.
                          </p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-[#0b0e11] border border-[#2d333b]">
                             <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest block mb-2">Total Cleared</span>
                             <span className="text-xl font-mono text-white font-bold">0.00 USD</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-[#0b0e11] border border-[#2d333b]">
                             <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest block mb-2">Success Rate</span>
                             <span className="text-xl font-mono text-green-500 font-bold">100.0%</span>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <NewsTicker />

      {/* FOOTER: System Diagnostics & AI Status */}
      <footer className="h-8 border-t border-[#2d333b] bg-[#161a1e] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">System Ready</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Active Pair:</span>
              <span className="text-[9px] font-mono font-bold text-blue-400">{selectedSymbol}</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[9px] font-mono text-gray-600">LATENCY: 42MS</span>
           <span className="text-[9px] font-mono text-gray-600">v1.2.4-STABLE</span>
        </div>
      </footer>
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div key="settings-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#161a1e] border border-[#2d333b] rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#2d333b] bg-gradient-to-r from-blue-600/10 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">Terminal Settings</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">System Configuration v1.2.4</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* EXECUTION SECTION */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-500" />
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Execution Parameters</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-600 font-bold uppercase">Default Trade Size</label>
                      <div className="relative">
                        <input type="text" defaultValue="500.00" className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl p-3 text-xs font-mono font-bold text-white focus:border-blue-500/50 outline-none" />
                        <span className="absolute right-3 top-3.5 text-[9px] text-gray-700 font-bold">USDT</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-600 font-bold uppercase">Max Leverage</label>
                      <div className="relative">
                        <input type="text" defaultValue="x100" className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl p-3 text-xs font-mono font-bold text-white focus:border-blue-500/50 outline-none" />
                        <span className="absolute right-3 top-3.5 text-[9px] text-gray-700 font-bold">CROSS</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* AI INTELLIGENCE SECTION */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Intelligence Engine</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[#0b0e11] p-4 rounded-2xl border border-gray-800">
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">Confidence Threshold</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Minimum probability for signals</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-blue-500">85%</span>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-blue-600 border-none cursor-pointer" />
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Auto-Scale Entry Targets</span>
                    </div>
                  </div>
                </section>

                {/* MAINTENANCE */}
                <section className="space-y-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">System Data</h4>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setTradeLogs([]);
                        addLog("Execution logs cleared.");
                      }}
                      className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-[10px] font-bold text-white uppercase tracking-widest transition-all"
                    >
                      Clear All Logs
                    </button>
                    <button 
                      onClick={() => {
                        setWallet({ balance: 10000, totalProfit: 0, trades: [] });
                        addLog("Account reset to default parameters.");
                      }}
                      className="flex-1 py-3 rounded-xl border border-red-500/20 bg-red-600/5 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      Reset Account
                    </button>
                  </div>
                </section>
              </div>

              <div className="p-6 bg-[#0b0e11] border-t border-[#2d333b]">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-[0.3em] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Update Configuration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
