'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGameState } from '@/src/lib/gameState';
import { ShoppingBag, Check, Sparkles, Coins, Wand, Monitor, Music, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ACC_SHOP = [
  { id: 'wizard-hat', name: 'Wizard Hat', cost: 50, icon: Wand },
  { id: 'cyber-visor', name: 'Cyber Visor', cost: 30, icon: Monitor },
  { id: 'dj-headphones', name: 'DJ Headphones', cost: 40, icon: Music },
  { id: 'royal-crown', name: 'Golden Crown', cost: 100, icon: Crown },
];

const QUOTES_ACTIVE = [
  "Feed me more semicolons!",
  "Is it a bug, or is it a surprise feature?",
  "O(N^2) is fine... if you like taking coffee breaks!",
  "Your code compiles! QUICK, MAKE A WISH!",
  "CSS alignment is my final boss.",
  "Errors are just proof that you are trying!",
  "Have you tried turning your computer off and on again?",
  "Don't worry, even senior devs google how to exit Vim.",
];

const QUOTES_SLEEPY = [
  "Zzz... Bug detected in my dream...",
  "Yawn... Streak is looking cold, let's solve a challenge!",
  "I'm sleeping. Wake me up with some fresh JavaScript!",
  "Need... syntax... sugar...",
];

const QUOTES_FIRE = [
  "We are on FIRE! Let's crush this daily quest!",
  "O(1) speeds achieved! You are a coding wizard!",
  "Algorithms fear us! Keep the streak alive!",
  "Compiling at the speed of sound!",
];

export default function CompanionPet() {
  const {
    streak,
    gold,
    petName,
    petAccessories,
    activeAccessories,
    buyAccessory,
    toggleAccessory,
  } = useGameState();

  const [quote, setQuote] = useState("Let's crush some bugs today!");
  const [showShop, setShowShop] = useState(false);
  const [wiggleState, setWiggleState] = useState(false);

  // Set randomized quote based on streak
  const triggerQuote = () => {
    setWiggleState(true);
    setTimeout(() => setWiggleState(false), 500);

    if (streak === 0) {
      const idx = Math.floor(Math.random() * QUOTES_SLEEPY.length);
      setQuote(QUOTES_SLEEPY[idx]);
    } else if (streak >= 4) {
      const idx = Math.floor(Math.random() * QUOTES_FIRE.length);
      setQuote(QUOTES_FIRE[idx]);
    } else {
      const idx = Math.floor(Math.random() * QUOTES_ACTIVE.length);
      setQuote(QUOTES_ACTIVE[idx]);
    }
  };

  useEffect(() => {
    triggerQuote();
  }, [streak]);

  // Determine pet state
  const isSleeping = streak === 0;
  const isOnFire = streak >= 4;

  return (
    <div className="bg-bg-card rounded-xl border border-border-card p-5 flex flex-col gap-4 glow-border relative overflow-hidden select-none">
      
      {/* Background Grid Accent for Arcade Feel */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent pointer-events-none opacity-50" />

      {/* Header Info */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
          <span className="text-sm font-bold uppercase tracking-wider font-mono text-text-main">
            {petName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-bg-base px-2.5 py-1 rounded-md border border-border-card text-xs font-mono font-bold text-accent-secondary">
          <Coins className="w-3.5 h-3.5 text-accent-secondary animate-bounce" />
          <span>{gold} G</span>
        </div>
      </div>

      {/* Dialog Box */}
      <div className="relative bg-bg-base border border-border-card p-3.5 rounded-lg text-sm text-text-main font-semibold min-h-[60px] flex items-center z-10 shadow-sm">
        <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-bg-base border-r border-b border-border-card rotate-45" />
        <p className="leading-snug">{quote}</p>
      </div>

      {/* Pet Interactive Visual Section */}
      <div className="relative h-32 flex items-center justify-center z-10 cursor-pointer" onClick={triggerQuote}>
        
        {/* Sleeping particles */}
        {isSleeping && (
          <div className="absolute top-2 left-[55%] flex flex-col font-mono font-bold text-xs text-primary opacity-80 animate-bounce">
            <span className="animate-pulse delay-100">Z</span>
            <span className="animate-pulse delay-300 ml-2">z</span>
            <span className="animate-pulse delay-500 ml-4">z</span>
          </div>
        )}

        {/* Fire glow */}
        {isOnFire && (
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-75 animate-pulse" />
        )}

        {/* Interactive Bouncy SVG Dino/Slime Character */}
        <motion.div
          className="relative w-24 h-24 flex items-center justify-center"
          animate={{
            y: isSleeping ? [2, -2, 2] : [0, -10, 0],
            scaleY: isSleeping ? 1 : [1, 0.9, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: isSleeping ? 3.5 : isOnFire ? 1.2 : 2.2,
            ease: 'easeInOut',
          }}
        >
          {/* SVG Character */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Body */}
            <path
              d="M20,70 Q20,30 50,30 Q80,30 80,70 Q80,85 50,85 Q20,85 20,70 Z"
              fill="var(--primary)"
              className="transition-colors duration-300"
            />
            {/* Face/Eyes */}
            {!isSleeping ? (
              <>
                {/* Active Eyes */}
                <circle cx="42" cy="55" r="5" fill="#000" />
                <circle cx="62" cy="55" r="5" fill="#000" />
                {/* Shiny reflex */}
                <circle cx="43.5" cy="53.5" r="1.5" fill="#fff" />
                <circle cx="63.5" cy="53.5" r="1.5" fill="#fff" />
                {/* Cheeks */}
                <circle cx="35" cy="62" r="4" fill="#ff4d6d" opacity="0.6" />
                <circle cx="69" cy="62" r="4" fill="#ff4d6d" opacity="0.6" />
                {/* Cute smile */}
                <path d="M48,63 Q52,67 56,63" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Sleeping Eyes (Closed arcs) */}
                <path d="M38,57 Q43,60 46,55" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M58,57 Q63,60 66,55" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Drool */}
                <path d="M47,68 C47,72 50,75 52,72" stroke="var(--accent-secondary)" strokeWidth="2.5" fill="none" />
              </>
            )}
            
            {/* Fire spikes on firey streak */}
            {isOnFire && (
              <>
                <polygon points="12,45 20,53 10,60" fill="var(--accent-secondary)" />
                <polygon points="88,45 80,53 90,60" fill="var(--accent-secondary)" />
                <polygon points="40,15 50,28 60,15" fill="var(--accent-secondary)" />
              </>
            )}
          </svg>

          {/* Accessory Overlays */}
          {activeAccessories.includes('wizard-hat') && (
            <div className="absolute -top-[18px] left-[15%] w-16 h-16 pointer-events-none drop-shadow-md">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10,80 Q50,75 90,80 L80,72 L55,10 Q50,5 45,10 L20,72 Z" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" />
                <circle cx="50" cy="8" r="4" fill="#fbbf24" />
                {/* Band */}
                <path d="M18,72 Q50,68 82,72 L79,66 Q50,62 21,66 Z" fill="#f59e0b" />
              </svg>
            </div>
          )}

          {activeAccessories.includes('royal-crown') && (
            <div className="absolute -top-[16px] left-[18%] w-14 h-14 pointer-events-none drop-shadow-md">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="10,80 20,30 40,55 50,20 60,55 80,30 90,80" fill="#f59e0b" stroke="#d97706" strokeWidth="3" />
                <circle cx="20" cy="27" r="3" fill="#ef4444" />
                <circle cx="50" cy="17" r="3" fill="#3b82f6" />
                <circle cx="80" cy="27" r="3" fill="#ef4444" />
                {/* Crown band */}
                <rect x="10" y="75" width="80" height="7" fill="#b45309" />
              </svg>
            </div>
          )}

          {activeAccessories.includes('cyber-visor') && (
            <div className="absolute top-[32px] left-[20%] w-[60%] h-4.5 pointer-events-none drop-shadow-md">
              <div className="w-full h-full bg-[#00f0ff] opacity-90 border border-white rounded-md shadow-[0_0_10px_#00f0ff] relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[-20px] w-5 bg-white skew-x-12 animate-pulse" />
              </div>
            </div>
          )}

          {activeAccessories.includes('dj-headphones') && (
            <div className="absolute top-[22px] left-[5%] w-[90%] h-12 pointer-events-none drop-shadow-md">
              <div className="w-full h-full relative">
                {/* Band */}
                <div className="absolute top-0 left-4 right-4 h-2 bg-[#ff007f] border border-black rounded-full" />
                {/* Earcups */}
                <div className="absolute top-0.5 left-0 w-5 h-9 bg-neutral-900 border border-[#ff007f] rounded-full shadow-[0_0_5px_#ff007f]" />
                <div className="absolute top-0.5 right-0 w-5 h-9 bg-neutral-900 border border-[#ff007f] rounded-full shadow-[0_0_5px_#ff007f]" />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Buttons: Customization & Info */}
      <div className="grid grid-cols-2 gap-3.5 z-10">
        <button
          onClick={triggerQuote}
          className="bg-bg-base hover:bg-border-card text-text-muted hover:text-text-main text-xs font-mono py-2.5 px-4 rounded-lg border border-border-card transition-colors cursor-pointer font-bold"
        >
          Poke Pet 👉
        </button>
        <button
          onClick={() => setShowShop(!showShop)}
          className={`text-xs font-mono py-2.5 px-4 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold ${
            showShop
              ? 'bg-primary text-black border-primary'
              : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shop Gear</span>
        </button>
      </div>

      {/* Expandable Accessory Shop & Wardrobe */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border-card pt-4 z-10 flex flex-col gap-3"
          >
            <p className="text-xs uppercase font-mono tracking-wider text-text-muted font-black">
              Accessorize Byte
            </p>
            <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1">
              {ACC_SHOP.map((acc) => {
                const isOwned = petAccessories.includes(acc.id);
                const isActive = activeAccessories.includes(acc.id);

                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-bg-base/70 border border-border-card text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <acc.icon className="w-5 h-5 text-text-muted" />
                      <span className="font-bold text-text-main">{acc.name}</span>
                    </div>

                    {isOwned ? (
                      <button
                        onClick={() => toggleAccessory(acc.id)}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1 ${
                          isActive
                            ? 'bg-primary text-black'
                            : 'bg-neutral-800 text-text-muted hover:bg-neutral-700'
                        }`}
                      >
                        {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{isActive ? 'Equipped' : 'Equip'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => buyAccessory(acc.id, acc.cost)}
                        disabled={gold < acc.cost}
                        className="bg-accent-secondary/10 hover:bg-accent-secondary text-accent-secondary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded text-xs font-mono font-bold border border-accent-secondary/20 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>{acc.cost} G</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
