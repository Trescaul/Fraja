import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Zap, Activity, MessageSquareDot } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Optimized timing for a snappier experience
    const timers = [
      setTimeout(() => setPhase(1), 1500),  // Scene 2 starts
      setTimeout(() => setPhase(2), 3500),  // Scene 3 starts
      setTimeout(() => setPhase(3), 5500),  // Scene 4 starts
      setTimeout(() => setPhase(4), 7500),  // Scene 5 starts (Drop)
      setTimeout(() => setPhase(5), 8500),  // Scene 6 starts (Reveal)
      setTimeout(() => setPhase(6), 11000), // Scene 7 starts (Exit)
      setTimeout(() => onComplete(), 13000), // Final handover
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden font-sans"
    >
      {/* Reduced Background Particles for better performance */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: 0,
              scale: 0.5 
            }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [0.5, 0.8, 0.5],
            }}
            transition={{ 
              duration: 4 + Math.random() * 4, 
              repeat: Infinity, 
              delay: Math.random() * 3 
            }}
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Scene 1: VOID (0-2s) - Silence and slow particles */}
        {phase === 0 && (
          <motion.div
            key="scene1"
            exit={{ opacity: 0 }}
            className="text-center"
          >
             {/* Void is primarily silence and subtle visual particles mentioned above */}
          </motion.div>
        )}

        {/* Scene 2: SYSTEM AWAKENING (2-5s) */}
        {phase === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full stroke-fraja-cyan/20 fill-none overflow-visible">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, ease: "linear" }}
                  d="M -50 90 Q 50 -50 150 90 T 350 90"
                  className="stroke-fraja-cyan/40 stroke-1"
                />
              </svg>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                 <BrainCircuit className="w-16 h-16 text-fraja-gold/60" />
              </motion.div>
            </div>
            
            <div className="text-center">
               <motion.h2 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1.5 }}
                 className="text-white text-2xl font-light tracking-[0.4em] uppercase italic"
               >
                 "You are now entering..."
               </motion.h2>
            </div>
          </motion.div>
        )}

        {/* Scene 3: INTELLIGENCE BUILD (5-8s) */}
        {phase === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-12 max-w-2xl px-8"
          >
             <div className="flex items-end gap-1 h-24">
               {[...Array(12)].map((_, i) => (
                 <motion.div
                   key={i}
                    initial={{ height: i % 2 === 0 ? 10 : 30 }}
                   animate={{ height: [10, 60, 20, 80, 10] }}
                   transition={{ 
                     repeat: Infinity, 
                     duration: 0.8, 
                     delay: i * 0.05 
                   }}
                   className={cn(
                     "w-1.5 rounded-full",
                     i % 2 === 0 ? "bg-fraja-gold" : "bg-fraja-cyan"
                   )}
                 />
               ))}
             </div>
             
             <div className="text-center space-y-6">
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                   className="text-white text-xl font-light tracking-[0.2em] uppercase"
                >
                  "...a system beyond ordinary perception."
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-fraja-gold text-sm font-bold tracking-[0.3em] uppercase italic"
                >
                  "...where data becomes understanding."
                </motion.p>
             </div>
          </motion.div>
        )}

        {/* Scene 4: SPIRITUAL / DEPTH (8-11s) */}
        {phase === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-12"
          >
            <motion.div
              animate={{ 
                 opacity: [0.8, 1, 0.8],
                 scale: [1, 1.02, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-40 h-40 bg-gradient-to-br from-fraja-gold to-fraja-cyan rounded-full flex items-center justify-center relative shadow-[0_0_40px_rgba(226,183,20,0.3)]"
            >
               <div className="absolute inset-1 border-2 border-white/20 rounded-full animate-spin duration-300" />
               <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_6s_linear_infinite]" />
               <Zap className="w-16 h-16 text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </motion.div>

            <div className="text-center space-y-6">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white text-xl font-bold tracking-[0.3em] uppercase italic"
                >
                  "Where the unseen becomes clear..."
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-fraja-gold text-lg font-black tracking-[0.5em] uppercase"
                >
                  "And precision replaces guesswork."
                </motion.p>
             </div>
          </motion.div>
        )}

        {/* Scene 5: DROP (11-13s) */}
        {phase === 4 && (
          <motion.div
            key="scene5"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative"
          >
             <motion.div
               initial={{ scale: 8, opacity: 0 }}
               animate={{ scale: 0, opacity: 1 }}
               transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
               className="w-96 h-96 border-[12px] border-fraja-gold rounded-full shadow-[0_0_100px_#e2b714]"
             />
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 0] }}
               transition={{ delay: 1.7, duration: 0.15 }}
               className="absolute inset-0 bg-white z-[100]"
             />
          </motion.div>
        )}

        {/* Scene 6: BRAND REVEAL (13-16s) */}
        {phase >= 5 && (
          <motion.div
            key="scene6"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
             className="flex flex-col items-center max-w-4xl w-full"
          >
             {/* Cinematic Logo Container */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
               className="relative p-12 rounded-[40px] bg-black/60 backdrop-blur-xl border border-fraja-gold/20 flex flex-col items-center gap-12 shadow-[0_0_80px_rgba(226,183,20,0.1)]"
             >
                <div className="relative group">
                  <motion.div
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.5, duration: 1, type: "spring" }}
                   className="relative z-10"
                  >
                     <img 
                       src="/logo.png" 
                       className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(226,183,20,0.4)]"
                       onError={(e) => {
                         e.currentTarget.style.display = 'none';
                         const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback-xl');
                         if (fallback) fallback.classList.remove('hidden');
                       }}
                     />
                     <div className="logo-fallback-xl hidden flex flex-col items-center">
                        <div className="w-48 h-48 rounded-full border-[6px] border-fraja-gold/80 flex items-center justify-center relative shadow-[0_0_50px_rgba(226,183,20,0.3)]">
                           <span className="text-8xl font-black italic text-fraja-gold drop-shadow-lg">FI</span>
                           <div className="absolute inset-0 border-t-[6px] border-fraja-cyan rounded-full animate-[spin_4s_linear_infinite]" />
                        </div>
                     </div>
                  </motion.div>
                  {/* Digital glimmers around logo */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-fraja-gold/10 via-transparent to-fraja-cyan/10 blur-3xl opacity-50" />
                </div>

                <div className="text-center space-y-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-6xl font-black italic tracking-tighter text-white"
                  >
                    FRAJA<span className="text-fraja-gold"> INTELLIGENCE</span>
                  </motion.h1>
                  
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.2, duration: 1.5 }}
                    className="h-1 bg-gradient-to-r from-transparent via-fraja-gold to-transparent" 
                  />

                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-fraja-gold text-lg font-black tracking-[0.6em] uppercase italic"
                  >
                    Where Precision Meets Profit
                  </motion.p>
                </div>
             </motion.div>

             {phase === 6 && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="mt-24 text-center"
               >
                  <p className="text-white/20 text-xs font-bold tracking-[0.8em] uppercase italic">
                    Trade with Intelligence
                  </p>
                  <motion.div 
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mt-4 w-px h-12 bg-gradient-to-b from-fraja-gold/40 to-transparent mx-auto"
                   />
               </motion.div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric lighting */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-fraja-gold/5 blur-[120px] rounded-full" />
         <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-fraja-cyan/5 blur-[120px] rounded-full" />
      </div>
    </motion.div>
  );
}

