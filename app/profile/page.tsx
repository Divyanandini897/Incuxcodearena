'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import Navigation from '@/src/components/Navigation';
import { useGameState, getXpForNextLevel } from '@/src/lib/gameState';
import { PROBLEMS_DATA } from '@/src/data/data';
import { 
  Award, 
  Coins, 
  Flame, 
  Sparkles, 
  Lock, 
  ArrowLeft, 
  Check, 
  TrendingUp, 
  Calendar,
  Pencil
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

const AVATAR_OPTIONS = [
  { id: 'sherlock', name: 'Sherlock Holmes', emoji: '🕵️‍♂️', desc: 'Default avatar. Analytical master of debug traces and logical deductions.', gradient: 'from-amber-600 to-orange-700', req: 'Level 1 (Default)' },
  { id: 'neo', name: 'Neo (The Matrix)', emoji: '🕶️', desc: 'Bypasses firewalls, parses deep binary, and bends compilation rules.', gradient: 'from-slate-700 to-slate-900', req: 'Level 2' },
  { id: 'yoda', name: 'Master Yoda', emoji: '🧙‍♂️', desc: 'Ancient senior developer. Masters recursion, closures, and the Force.', gradient: 'from-emerald-600 to-teal-700', req: 'Level 3' },
  { id: 'stark', name: 'Tony Stark', emoji: '🦾', desc: 'Builds complex compiler rigs, custom databases, and high-performance scripts.', gradient: 'from-red-600 to-yellow-600', req: 'Level 4' },
];

const TITLES_CONFIG = [
  { name: 'Bug Rookie', reqLevel: 1, icon: '🐣' },
  { name: 'Semicolon Survivor', reqLevel: 3, icon: '🩹' },
  { name: 'Callback Crusader', reqLevel: 5, icon: '⚔️' },
  { name: 'O(1) Sorcerer', reqLevel: 8, icon: '🧙‍♂️' },
  { name: 'Kernel Conqueror', reqLevel: 12, icon: '👑' },
];

const ACHIEVEMENTS_LIST = [
  { id: 'First Semicolon', title: 'First Semicolon', desc: 'Solve your first problem successfully.', emoji: '💾' },
  { id: 'Code Crusader', title: 'Code Crusader', desc: 'Solve 5 problems in the library.', emoji: '🛡️' },
  { id: 'Dragon Slayer', title: 'Dragon Slayer', desc: 'Solve a Hard level problem.', emoji: '🐉' },
  { id: 'Streak Legend', title: 'Streak Legend', desc: 'Reach a streak multiplier of 7 days or more.', emoji: '🔥' },
  { id: 'Pet Stylist', title: 'Pet Stylist', desc: 'Purchase at least one customization item for Byte.', emoji: '👒' },
  { id: 'High Level Coder', title: 'High Level Coder', desc: 'Reach level 5 to unlock senior status.', emoji: '🎓' },
];

// Hexagon SVG math for radar chart
const RADAR_CENTER = 140;
const RADAR_MAX_R = 105;
const ANGLES = [
  -Math.PI / 2,      // 12 o'clock: Algorithms Solved
  -Math.PI / 6,      // 2 o'clock: Categories Mastered
  Math.PI / 6,       // 4 o'clock: Topics Covered
  Math.PI / 2,       // 6 o'clock: Streak Days
  (5 * Math.PI) / 6,  // 8 o'clock: Items Purchased
  (7 * Math.PI) / 6,  // 10 o'clock: Accuracy Rate
];

const ATTRIBUTE_NAMES = [
  'Algorithms',
  'Categories',
  'Topics Covered',
  'Streak Days',
  'Items Bought',
  'Accuracy Rate'
];

export default function ProfilePage() {
  const {
    level,
    xp,
    gold,
    streak,
    solvedIds,
    avatar,
    title,
    unlockedTitles,
    unlockedAchievements,
    petAccessories,
    updateAvatar,
    updateTitle,
    userName,
    updateUserName
  } = useGameState();

  const [activeTab, setActiveTab] = useState<'avatar' | 'title'>('avatar');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    if (tempName.trim().length > 0) {
      updateUserName(tempName.trim());
      setIsEditingName(false);
    }
  };

  // Compute solved data
  const solvedProblems = useMemo(() => {
    return PROBLEMS_DATA.filter(p => solvedIds.includes(p.id));
  }, [solvedIds]);

  const solvedBreakdown = useMemo(() => {
    let easy = 0, medium = 0, hard = 0;
    solvedProblems.forEach(p => {
      if (p.difficulty === 'Easy') easy++;
      else if (p.difficulty === 'Medium') medium++;
      else if (p.difficulty === 'Hard') hard++;
    });
    return { easy, medium, hard };
  }, [solvedProblems]);

  // Compute stats metrics (0 to 100)
  const attributes = useMemo(() => {
    const strength = Math.min(100, 30 + (solvedBreakdown.easy * 10) + (solvedBreakdown.medium * 15) + (solvedBreakdown.hard * 30));
    const categoriesSolved = new Set(solvedProblems.map(p => p.category)).size;
    const intelligence = Math.min(100, 20 + categoriesSolved * 25);
    const topicsSolved = new Set(solvedProblems.flatMap(p => p.topics)).size;
    const agility = Math.min(100, 15 + topicsSolved * 15);
    const stamina = Math.min(100, 25 + streak * 10);
    const charisma = Math.min(100, 20 + petAccessories.length * 20 + Math.floor(gold / 2));

    const avgAcceptance = solvedProblems.length > 0 
      ? Math.floor(solvedProblems.reduce((sum, p) => sum + parseFloat(p.acceptance), 0) / solvedProblems.length)
      : 53;
    const dexterity = Math.min(100, 30 + avgAcceptance);

    return [strength, intelligence, agility, stamina, charisma, dexterity];
  }, [solvedBreakdown, solvedProblems, streak, gold, petAccessories]);

  // Calculate coordinates for the radar polygon path
  const radarPoints = useMemo(() => {
    return attributes.map((val, i) => {
      const r = (val / 100) * RADAR_MAX_R;
      const x = RADAR_CENTER + r * Math.cos(ANGLES[i]);
      const y = RADAR_CENTER + r * Math.sin(ANGLES[i]);
      return { x, y };
    });
  }, [attributes]);

  const radarPointsString = useMemo(() => {
    return radarPoints.map(p => `${p.x},${p.y}`).join(' ');
  }, [radarPoints]);

  const handleEquipTitle = (newTitle: string) => {
    if (unlockedTitles.includes(newTitle)) {
      updateTitle(newTitle);
    }
  };

  const currentAvatarInfo = AVATAR_OPTIONS.find(a => a.id === avatar) || AVATAR_OPTIONS[0];

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col antialiased">
      <Navigation streakCount={streak} />

      <main className="flex-1 p-8 max-w-[1500px] w-full mx-auto flex flex-col gap-8 font-sans">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-card border border-border-card text-text-muted hover:text-text-main hover:border-primary transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-text-main flex items-center gap-2">
              My Profile
            </h1>
            <p className="text-sm text-text-muted">Customize your developer avatar, choose your title, and view your solved metrics.</p>
          </div>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5/12) - Avatar Customizer, Title Equip & General Status */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Main Character Showcase Card */}
            <div className="bg-bg-card border border-border-card rounded-xl p-6 flex flex-col gap-5 glow-border relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/25 text-primary border-l border-b border-primary/30 px-4 py-1.5 rounded-bl-xl font-mono text-xs font-black tracking-wider">
                DEVELOPER ACCOUNT
              </div>

              <div className="flex items-center gap-5 mt-4">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${currentAvatarInfo.gradient} p-[3px] flex items-center justify-center text-6xl shadow-xl shadow-black/40 animate-float`}>
                  <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center">
                    {currentAvatarInfo.emoji}
                  </div>
                </div>
                <div className="flex-1 flex flex-col leading-tight gap-1.5">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        maxLength={18}
                        className="bg-bg-base border border-border-card rounded px-3 py-1.5 text-sm font-extrabold focus:outline-none focus:border-primary text-text-main w-full max-w-[200px]"
                      />
                      <button 
                        onClick={handleSaveName}
                        className="bg-primary text-white font-mono font-bold text-xs px-3 py-2 rounded cursor-pointer hover:bg-primary-hover transition-colors"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => { setIsEditingName(false); setTempName(userName); }}
                        className="bg-neutral-800 border border-border-card text-text-muted hover:text-text-main font-mono font-bold text-xs px-3 py-2 rounded cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <h2 className="text-2xl font-black tracking-tight text-text-main">
                        {userName}
                      </h2>
                      <button 
                        onClick={() => { setIsEditingName(true); setTempName(userName); }}
                        className="text-text-muted hover:text-text-main p-1 rounded cursor-pointer transition-colors"
                        title="Edit name"
                      >
                        <Pencil className="w-4.5 h-4.5 text-text-muted" />
                      </button>
                    </div>
                  )}
                  <span className="text-xs text-primary font-mono font-black uppercase tracking-wider leading-none">{title}</span>
                  <span className="text-sm text-text-muted font-mono font-bold">Level {level} Coder</span>
                  <div className="flex items-center gap-4 mt-2 text-sm text-text-main font-mono font-bold">
                    <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-lg border border-yellow-500/20">
                      <Coins className="w-4 h-4" />
                      {gold} Gold
                    </span>
                    <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-lg border border-amber-500/20">
                      <Flame className="w-4 h-4" />
                      {streak} D Streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Slider (XP) */}
              <div className="flex flex-col gap-2 font-mono text-xs border-t border-border-card/50 pt-5 mt-3">
                <div className="flex justify-between font-bold text-text-main">
                  <span>EXP to Level {level + 1}</span>
                  <span className="text-text-muted">{xp}/{getXpForNextLevel(level)} XP</span>
                </div>
                <div className="w-full h-4.5 bg-bg-base rounded-full overflow-hidden border border-border-card p-[2px]">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent-secondary rounded-full transition-all duration-500 shadow-[0_0_12px_var(--primary)]"
                    style={{ width: `${Math.min(100, Math.floor((xp / getXpForNextLevel(level)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Customization Tabs Card */}
            <div className="bg-bg-card border border-border-card rounded-xl p-5 flex flex-col gap-5 glow-border">
              
              {/* Tab headers */}
              <div className="flex border-b border-border-card">
                <button
                  onClick={() => setActiveTab('avatar')}
                  className={`flex-1 pb-3.5 text-sm font-mono font-black cursor-pointer transition-colors border-b-2 ${activeTab === 'avatar' ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-main'}`}
                >
                  🎭 Select Avatar
                </button>
                <button
                  onClick={() => setActiveTab('title')}
                  className={`flex-1 pb-3.5 text-sm font-mono font-black cursor-pointer transition-colors border-b-2 ${activeTab === 'title' ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-main'}`}
                >
                  🏅 Equip Title
                </button>
              </div>

              {/* Tab Contents */}
              <div className="mt-1">
                {activeTab === 'avatar' && (
                  <div className="flex flex-col gap-4">
                    {AVATAR_OPTIONS.map((opt) => {
                      const isEquipped = avatar === opt.id;
                      const levelReq = opt.id === 'sherlock' ? 1 : opt.id === 'neo' ? 2 : opt.id === 'yoda' ? 3 : 4;
                      const isLocked = level < levelReq;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (!isLocked) updateAvatar(opt.id);
                          }}
                          className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                            isEquipped 
                              ? 'bg-primary/10 border-primary cursor-pointer'
                              : isLocked 
                                ? 'bg-bg-base/30 border-border-card/45 opacity-60 cursor-not-allowed'
                                : 'bg-bg-base/60 border-border-card hover:border-primary/45 cursor-pointer'
                          }`}
                        >
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${opt.gradient} p-[2px] flex items-center justify-center text-4xl shadow-md`}>
                            <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center">
                              {isLocked ? <Lock className="w-5 h-5 text-text-muted" /> : opt.emoji}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col leading-tight">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-extrabold text-text-main">{opt.name}</span>
                              {isLocked ? (
                                <span className="text-[10px] font-mono font-black bg-neutral-900 border border-border-card px-2 py-0.5 rounded text-red-400">
                                  Unlocks at Lvl {levelReq}
                                </span>
                              ) : isEquipped ? (
                                <span className="text-[10px] font-mono font-black bg-primary text-black px-2 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                  <Check className="w-3.5 h-3.5" /> Equipped
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{opt.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'title' && (
                  <div className="flex flex-col gap-3">
                    {TITLES_CONFIG.map((cfg) => {
                      const isEquipped = title === cfg.name;
                      const isUnlocked = level >= cfg.reqLevel;

                      return (
                        <div
                          key={cfg.name}
                          onClick={() => {
                            if (isUnlocked) handleEquipTitle(cfg.name);
                          }}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            isEquipped
                              ? 'bg-primary/10 border-primary cursor-pointer'
                              : isUnlocked
                                ? 'bg-bg-base/60 border-border-card hover:border-primary/45 cursor-pointer'
                                : 'bg-bg-base/30 border-border-card/45 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-xl">{cfg.icon}</span>
                            <span className="text-sm font-extrabold text-text-main">{cfg.name}</span>
                          </div>

                          {isUnlocked ? (
                            isEquipped ? (
                              <span className="text-[10px] font-mono font-black bg-primary text-black px-3 py-1 rounded flex items-center gap-0.5 shadow-sm">
                                <Check className="w-3.5 h-3.5" /> Equipped
                              </span>
                            ) : (
                              <button className="text-[10px] font-mono font-black bg-neutral-800 text-text-muted hover:text-text-main px-3 py-1 rounded border border-border-card cursor-pointer">
                                Equip
                              </button>
                            )
                          ) : (
                            <span className="text-[10px] font-mono font-black bg-neutral-900 border border-border-card px-3 py-1 rounded text-text-muted flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" /> Lvl {cfg.reqLevel}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column (7/12) - Skill Radar, Trophies & victories history */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Hexagonal Radar Chart & Attribute Sheet */}
            <div className="bg-bg-card border border-border-card rounded-xl p-6 flex flex-col md:flex-row gap-8 items-center justify-between glow-border">
              
              {/* Radar Chart Visual */}
              <div className="relative w-[280px] h-[280px] flex items-center justify-center flex-shrink-0 bg-bg-base/40 rounded-full border border-border-card/50 p-2">
                <svg width="280" height="280" viewBox="0 0 280 280" className="w-full h-full overflow-visible">
                  {/* Concentric grid lines (Concentric Hexagons) */}
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
                    const radius = RADAR_MAX_R * scale;
                    const points = ANGLES.map(angle => {
                      const x = RADAR_CENTER + radius * Math.cos(angle);
                      const y = RADAR_CENTER + radius * Math.sin(angle);
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <polygon 
                        key={scale}
                        points={points}
                        fill="none"
                        stroke="var(--border-card)"
                        strokeWidth="1.2"
                        className="opacity-70"
                      />
                    );
                  })}

                  {/* Axes lines from center to outer edge */}
                  {ANGLES.map((angle, idx) => {
                    const x2 = RADAR_CENTER + RADAR_MAX_R * Math.cos(angle);
                    const y2 = RADAR_CENTER + RADAR_MAX_R * Math.sin(angle);
                    return (
                      <line 
                        key={idx}
                        x1={RADAR_CENTER}
                        y1={RADAR_CENTER}
                        x2={x2}
                        y2={y2}
                        stroke="var(--border-card)"
                        strokeWidth="1.2"
                        className="opacity-60"
                      />
                    );
                  })}

                  {/* Labels on vertices */}
                  {ANGLES.map((angle, idx) => {
                    const offset = 22;
                    const x = RADAR_CENTER + (RADAR_MAX_R + offset) * Math.cos(angle);
                    const y = RADAR_CENTER + (RADAR_MAX_R + offset) * Math.sin(angle);
                    const isLeft = Math.cos(angle) < -0.1;
                    const isRight = Math.cos(angle) > 0.1;
                    
                    return (
                      <text
                        key={idx}
                        x={x}
                        y={y + 4}
                        fill="var(--text-muted)"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="inherit"
                        textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
                        className="select-none text-[10px]"
                      >
                        {ATTRIBUTE_NAMES[idx]}
                      </text>
                    );
                  })}

                  {/* The User Skill Area Polygon */}
                  <polygon
                    points={radarPointsString}
                    fill="var(--primary)"
                    fillOpacity="0.18"
                    stroke="var(--primary)"
                    strokeWidth="3.5"
                    className="transition-all duration-700 ease-out"
                    style={{ filter: 'drop-shadow(0 0 6px var(--primary))' }}
                  />

                  {/* Dots at vertices of user stats */}
                  {radarPoints.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="5.5"
                      fill="var(--accent-secondary)"
                      stroke="#fff"
                      strokeWidth="1.5"
                      className="transition-all duration-700 ease-out"
                    />
                  ))}
                </svg>
              </div>

              {/* Attributes Sheet text list */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex items-center gap-2 border-b border-border-card pb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main">
                    My Statistics
                  </h3>
                </div>

                <div className="flex flex-col gap-3 font-mono text-xs">
                  {ATTRIBUTE_NAMES.map((name, idx) => {
                    const value = attributes[idx];
                    return (
                      <div key={name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-text-muted flex items-center gap-2">
                            <span className="text-[11px] w-5 h-5 flex items-center justify-center bg-bg-base/80 border border-border-card rounded font-mono text-accent-secondary">
                              {idx + 1}
                            </span>
                            {name}
                          </span>
                          <span className="text-text-main font-extrabold">{value} / 100</span>
                        </div>
                        <div className="w-full h-2.5 bg-bg-base rounded-full overflow-hidden border border-border-card/30 p-[1px]">
                          <div 
                            className="h-full bg-accent-secondary rounded-full transition-all duration-700 shadow-[0_0_8px_var(--accent-secondary)]"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Achievement Trophies Cabinet */}
            <div className="bg-bg-card border border-border-card rounded-xl p-6 flex flex-col gap-5 glow-border">
              <div className="flex items-center justify-between border-b border-border-card pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main">
                    Trophies & Badges
                  </h3>
                </div>
                <span className="text-xs font-mono text-text-muted font-bold">
                  {unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length} Unlocked
                </span>
              </div>

              {/* Cabinet Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {ACHIEVEMENTS_LIST.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);

                  return (
                    <div
                      key={ach.id}
                      className={`relative p-4 rounded-lg border-2 flex flex-col items-center text-center gap-3 group transition-all duration-300 ${
                        isUnlocked
                          ? 'bg-bg-base/60 border-primary/20 hover:border-primary cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_15px_var(--primary)]'
                          : 'bg-bg-base/20 border-border-card/40 opacity-50 select-none'
                      }`}
                      title={ach.desc}
                    >
                      {/* Trophy Medal Icon */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-transform duration-500 ${isUnlocked ? 'bg-primary/10 group-hover:rotate-12 group-hover:scale-105 shadow-sm' : 'bg-neutral-900'}`}>
                        {isUnlocked ? ach.emoji : <Lock className="w-5 h-5 text-text-muted" />}
                      </div>

                      <div className="flex flex-col gap-1 leading-none">
                        <span className="text-xs font-extrabold text-text-main truncate max-w-[120px]">{ach.title}</span>
                        <span className="text-[10px] text-text-muted line-clamp-2 mt-1 leading-snug h-8">
                          {ach.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Victory History Logs */}
            <div className="bg-bg-card border border-border-card rounded-xl p-6 flex flex-col gap-5 glow-border">
              <div className="flex items-center gap-2 border-b border-border-card pb-3">
                <Calendar className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main">
                  Recent Accomplishments
                </h3>
              </div>

              {/* Chronicles list */}
              {solvedProblems.length === 0 ? (
                <p className="text-xs text-text-muted font-mono text-center py-6">
                  No solved questions history found. Solve a challenge to start!
                </p>
              ) : (
                <div className="flex flex-col gap-4 font-mono text-xs relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-border-card">
                  {solvedProblems.map((prob) => {
                    return (
                      <div key={prob.id} className="flex gap-5 items-start relative z-10">
                        <div className="w-8.5 h-8.5 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                          <ShieldCheck className="w-4.5 h-4.5 fill-emerald-500/10" />
                        </div>
                        <div className="flex flex-col gap-1.5 bg-bg-base/50 p-3.5 rounded-lg border border-border-card flex-1">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-emerald-500 uppercase tracking-wider">CHALLENGE SOLVED</span>
                            <span className="text-text-muted">July 9, 2026</span>
                          </div>
                          <span className="text-sm font-black text-text-main mt-0.5">
                            {prob.title}
                          </span>
                          <p className="text-xs text-text-muted leading-relaxed mt-1">
                            Earned +{prob.difficulty === 'Easy' ? 100 : prob.difficulty === 'Medium' ? 200 : 400} XP and +{prob.difficulty === 'Easy' ? 15 : prob.difficulty === 'Medium' ? 30 : 60} Gold.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

// Inline component to satisfy imports cleanly
function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
