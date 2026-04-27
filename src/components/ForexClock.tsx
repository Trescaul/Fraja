import React, { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

interface Session {
  name: string;
  open: number; // UTC hour
  close: number; // UTC hour
  color: string;
}

const SESSIONS: Session[] = [
  { name: 'SYDNEY', open: 22, close: 7, color: 'text-blue-400' },
  { name: 'TOKYO', open: 0, close: 9, color: 'text-red-400' },
  { name: 'LONDON', open: 8, close: 17, color: 'text-fraja-gold' },
  { name: 'NEW YORK', open: 13, close: 22, color: 'text-green-400' },
];

export default function ForexClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getUtcTime = () => {
    const now = new Date();
    return {
      hours: now.getUTCHours(),
      minutes: now.getUTCMinutes(),
      seconds: now.getUTCSeconds(),
      formatted: now.toISOString().split('T')[1].split('.')[0]
    };
  };

  const utc = getUtcTime();

  const isSessionOpen = (session: Session) => {
    const h = utc.hours;
    if (session.open < session.close) {
      return h >= session.open && h < session.close;
    }
    // Overlapping midnight (Sydney)
    return h >= session.open || h < session.close;
  };

  return (
    <div className="flex items-center gap-6 px-4 py-1.5 bg-black/20 border border-white/5 rounded-full backdrop-blur-md">
      <div className="flex items-center gap-2 pr-4 border-r border-white/10">
        <Clock className="w-3.5 h-3.5 text-fraja-gold animate-pulse" />
        <span className="text-[11px] font-mono font-black text-white tracking-widest">
          {utc.formatted} <span className="text-gray-500">UTC</span>
        </span>
      </div>

      <div className="flex items-center gap-5">
        {SESSIONS.map((session) => {
          const open = isSessionOpen(session);
          return (
            <div key={session.name} className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "text-[9px] font-bold tracking-tighter transition-colors",
                  open ? "text-white" : "text-gray-600"
                )}>
                  {session.name}
                </span>
                <div className={cn(
                  "w-1 h-1 rounded-full",
                  open ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-gray-800"
                )} />
              </div>
              <span className={cn(
                "text-[7px] font-black uppercase tracking-[0.2em] scale-90",
                open ? session.color : "text-gray-700"
              )}>
                {open ? 'ACTIVE' : 'CLOSED'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
