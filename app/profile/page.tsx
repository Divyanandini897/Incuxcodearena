'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { useGameState, getXpForNextLevel } from '@/src/lib/gameState';
import { PROBLEMS_DATA } from '@/src/data/data';
import CompanionPet from '@/src/components/dashboard/CompanionPet';
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
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import Badge from '@/src/components/ui/Badge';

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
  (-5 * Math.PI) / 6, // 10 o'clock: Avg Solve speed/Dexterity
];

const ATTRIBUTE_NAMES = [
  'Algorithms',
  'Categories',
  'Topics',
  'Streak Days',
  'Customizations',
  'Dexterity'
];

export default function ProfilePage() {
  const { 
    userName, 
    level, 
    xp, 
    gold, 
    streak, 
    title, 
    avatar, 
    solvedIds, 
    petAccessories, 
    unlockedTitles,
    unlockedAchievements,
    updateUserName,
    updateTitle,
    updateAvatar
  } = useGameState();

  const [activeTab, setActiveTab] = useState<'avatar' | 'title'>('avatar');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Fetch full details of solved problems
  const solvedProblems = useMemo(() => {
    return PROBLEMS_DATA.filter((p) => solvedIds.includes(p.id));
  }, [solvedIds]);

  const solvedBreakdown = useMemo(() => {
    return {
      easy: solvedProblems.filter(p => p.difficulty === 'Easy').length,
      medium: solvedProblems.filter(p => p.difficulty === 'Medium').length,
      hard: solvedProblems.filter(p => p.difficulty === 'Hard').length,
    };
  }, [solvedProblems]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUserName(tempName.trim());
      setIsEditingName(false);
    }
  };

  // Mock Calendar days
  const calendarDays = useMemo(() => {
    const arr = [];
    // July 2026 starts on Wednesday (3 empty slots)
    for (let i = 0; i < 3; i++) arr.push(null);
    for (let i = 1; i <= 31; i++) arr.push(i);
    return arr;
  }, []);

  const currentDay = 11; // July 11, 2026

  // Derived user statistics for attributes (0 to 100)
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
    <AppLayout>
        {/* Navigation & Header */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-card border border-border-card text-text-muted hover:text-text-main transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-text-main">
              Profile
            </h1>
            <p className="text-[11px] text-text-muted">Customize your developer avatar, choose your title, and view your solved metrics.</p>
          </div>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
          
          {/* Left Column (5/12) - Avatar Customizer, Title Equip & General Status */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Main Character Showcase Card */}
            <Card className="flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary border-l border-b border-border-card px-3 py-1 rounded-bl-lg font-mono text-[9px] font-bold tracking-wider">
                Rank Player
              </div>

              <div className="flex items-center gap-4.5 mt-2">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentAvatarInfo.gradient} p-[2px] flex items-center justify-center text-4xl shrink-0`}>
                  <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center">
                    {currentAvatarInfo.emoji}
                  </div>
                </div>
                <div className="flex-1 flex flex-col leading-tight gap-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <input 
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        maxLength={18}
                        className="bg-bg-base border border-border-card rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-primary text-text-main w-full max-w-[150px]"
                      />
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={handleSaveName}
                        className="h-7 px-2.5"
                      >
                        Save
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => { setIsEditingName(false); setTempName(userName); }}
                        className="h-7 px-2.5"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-lg font-bold tracking-tight text-text-main truncate">
                        {userName}
                      </h2>
                      <button 
                        onClick={() => { setIsEditingName(true); setTempName(userName); }}
                        className="text-text-muted hover:text-text-main p-1 rounded cursor-pointer transition-colors"
                        title="Edit name"
                      >
                        <Pencil className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                    </div>
                  )}
                  <span className="text-[10px] text-primary font-mono font-bold uppercase tracking-wider leading-none mt-0.5">{title}</span>
                  <span className="text-[11px] text-text-muted font-bold">Level {level} Coder</span>
                  
                  {/* Compact minimal status text widgets */}
                  <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-text-muted">
                    <span className="flex items-center gap-1" title="Platform Gold">
                      <Coins className="w-3.5 h-3.5 text-yellow-500" />
                      <span>{gold} gold</span>
                    </span>
                    <span className="flex items-center gap-1" title="Daily Streak">
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" />
                      <span>{streak} days</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Slider (XP) */}
              <div className="flex flex-col gap-2 text-[11px] border-t border-border-card/50 pt-4 mt-1">
                <div className="flex justify-between font-bold text-text-main">
                  <span>XP to Level {level + 1}</span>
                  <span className="text-text-muted font-mono">{xp}/{getXpForNextLevel(level)} XP</span>
                </div>
                <div className="w-full h-1 bg-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.floor((xp / getXpForNextLevel(level)) * 100))}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Customization Tabs Card */}
            <Card className="flex flex-col gap-4">
              
              {/* Tab headers */}
              <div className="flex border-b border-border-card/50">
                <button
                  onClick={() => setActiveTab('avatar')}
                  className={`flex-1 pb-2.5 text-xs font-bold cursor-pointer transition-colors border-b-2 ${activeTab === 'avatar' ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-main'}`}
                >
                  🎭 Select Avatar
                </button>
                <button
                  onClick={() => setActiveTab('title')}
                  className={`flex-1 pb-2.5 text-xs font-bold cursor-pointer transition-colors border-b-2 ${activeTab === 'title' ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-main'}`}
                >
                  🏅 Equip Title
                </button>
              </div>

              {/* Tab Contents */}
              <div className="mt-1">
                {activeTab === 'avatar' && (
                  <div className="flex flex-col gap-3">
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
                          className={`flex items-center gap-3.5 p-3 rounded-lg border transition-all ${
                            isEquipped 
                              ? 'bg-hover border-primary/20 cursor-pointer'
                              : isLocked 
                                ? 'bg-bg-base/30 border-border-card/45 opacity-60 cursor-not-allowed'
                                : 'bg-bg-card border-border-card hover:border-border-card/85 cursor-pointer'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${opt.gradient} p-[1px] flex items-center justify-center text-2xl shadow-xs shrink-0`}>
                            <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center">
                              {isLocked ? <Lock className="w-4 h-4 text-text-muted" /> : opt.emoji}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col leading-tight min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs font-bold text-text-main truncate">{opt.name}</span>
                              {isLocked ? (
                                <span className="text-[9px] font-mono font-bold bg-bg-base border border-border-card px-1.5 py-0.5 rounded text-red-500">
                                  Lvl {levelReq}
                                </span>
                              ) : isEquipped ? (
                                <span className="text-[9px] font-mono font-bold text-primary flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Equipped
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[10px] text-text-muted mt-1 leading-relaxed line-clamp-2">{opt.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'title' && (
                  <div className="flex flex-col gap-2.5">
                    {TITLES_CONFIG.map((cfg) => {
                      const isEquipped = title === cfg.name;
                      const isUnlocked = level >= cfg.reqLevel;

                      return (
                        <div
                          key={cfg.name}
                          onClick={() => {
                            if (isUnlocked) handleEquipTitle(cfg.name);
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isEquipped
                              ? 'bg-hover border-primary/20 cursor-pointer'
                              : isUnlocked
                                ? 'bg-bg-card border-border-card hover:border-border-card/85 cursor-pointer'
                                : 'bg-bg-base/30 border-border-card/45 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{cfg.icon}</span>
                            <span className="text-xs font-bold text-text-main">{cfg.name}</span>
                          </div>

                          {isUnlocked ? (
                            isEquipped ? (
                              <span className="text-[9px] font-mono font-bold text-primary flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Equipped
                              </span>
                            ) : (
                              <Button 
                                variant="secondary" 
                                size="sm"
                                className="h-6 px-2.5 text-[10px]"
                              >
                                Equip
                              </Button>
                            )
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-text-muted flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Lvl {cfg.reqLevel}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            {/* Companion Developer Pet widget */}
            <CompanionPet />
          </div>

          {/* Right Column (7/12) - Skill Radar, Trophies & victories history */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Hexagonal Radar Chart & Attribute Sheet */}
            <Card className="flex flex-col md:flex-row gap-6 items-center justify-between">
              
              {/* Radar Chart Visual (Subtle outlines, flat styling) */}
              <div className="relative w-[240px] h-[240px] flex items-center justify-center flex-shrink-0 bg-bg-base/40 rounded-full border border-border-card/30 p-2">
                <svg width="240" height="240" viewBox="0 0 280 280" className="w-full h-full overflow-visible">
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
                        stroke="var(--color-border-card)"
                        strokeWidth="1"
                        className="opacity-60"
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
                        stroke="var(--color-border-card)"
                        strokeWidth="1"
                        className="opacity-55"
                      />
                    );
                  })}

                  {/* Labels on vertices */}
                  {ANGLES.map((angle, idx) => {
                    const offset = 18;
                    const x = RADAR_CENTER + (RADAR_MAX_R + offset) * Math.cos(angle);
                    const y = RADAR_CENTER + (RADAR_MAX_R + offset) * Math.sin(angle);
                    const isLeft = Math.cos(angle) < -0.1;
                    const isRight = Math.cos(angle) > 0.1;
                    
                    return (
                      <text
                        key={idx}
                        x={x}
                        y={y + 3}
                        fill="var(--color-text-muted)"
                        fontSize="9"
                        fontWeight="semibold"
                        fontFamily="inherit"
                        textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
                        className="select-none text-[9px]"
                      >
                        {ATTRIBUTE_NAMES[idx]}
                      </text>
                    );
                  })}

                  {/* The User Skill Area Polygon (No glow filter, clean stroke) */}
                  <polygon
                    points={radarPointsString}
                    fill="var(--color-primary)"
                    fillOpacity="0.12"
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Dots at vertices of user stats */}
                  {radarPoints.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="var(--color-accent-secondary)"
                      stroke="var(--color-bg-card)"
                      strokeWidth="1"
                      className="transition-all duration-700 ease-out"
                    />
                  ))}
                </svg>
              </div>

              {/* Attributes Sheet text list */}
              <div className="flex-1 flex flex-col gap-3.5 w-full">
                <div className="flex items-center gap-2 border-b border-border-card/50 pb-2">
                  <TrendingUp className="w-4 h-4 text-text-muted" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main">
                    My Statistics
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5 font-mono text-[10px]">
                  {ATTRIBUTE_NAMES.map((name, idx) => {
                    const value = attributes[idx];
                    return (
                      <div key={name} className="flex flex-col gap-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-text-muted flex items-center gap-1.5">
                            <span className="text-[9px] w-4.5 h-4.5 flex items-center justify-center bg-hover border border-border-card/35 rounded font-mono text-accent-secondary">
                              {idx + 1}
                            </span>
                            {name}
                          </span>
                          <span className="text-text-main font-bold">{value}/100</span>
                        </div>
                        <div className="w-full h-1 bg-hover rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent-secondary rounded-full transition-all duration-700"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Achievement Trophies Cabinet */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-card pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-text-muted" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main">
                    Trophies & Badges
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-text-muted font-bold">
                  {unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length} unlocked
                </span>
              </div>

              {/* Cabinet Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACHIEVEMENTS_LIST.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);

                  return (
                    <div
                      key={ach.id}
                      className={`relative p-3 rounded-lg border flex flex-col items-center text-center gap-2.5 transition-all duration-200 ${
                        isUnlocked
                          ? 'bg-bg-card border-border-card hover:border-primary/20 cursor-pointer hover:-translate-y-0.5'
                          : 'bg-bg-card border-border-card/35 opacity-45 select-none'
                      }`}
                      title={ach.desc}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-transform duration-300 ${isUnlocked ? 'bg-hover' : 'bg-bg-base border border-border-card/20'}`}>
                        {isUnlocked ? ach.emoji : <Lock className="w-4 h-4 text-text-muted/65" />}
                      </div>

                      <div className="flex flex-col gap-0.5 leading-none">
                        <span className="text-[10.5px] font-bold text-text-main truncate max-w-[120px]">{ach.title}</span>
                        <span className="text-[9px] text-text-muted line-clamp-2 mt-1 leading-snug h-6">
                          {ach.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Daily Activity Heatmap calendar */}
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold border-b border-border-card pb-2">
                <div className="flex items-center gap-1.5 text-text-main text-xs font-bold">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <span>Daily Activity Heatmap</span>
                </div>
                <span className="text-[9px] font-mono text-text-muted font-bold">Grid</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-mono font-bold text-text-muted/65 select-none">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-xs select-none">
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={idx} />;
                  
                  const isToday = day === currentDay;
                  const isPast = day < currentDay;

                  return (
                    <div 
                      key={idx}
                      className={`relative aspect-square flex items-center justify-center rounded-full text-xs font-bold ${
                        isToday 
                          ? 'bg-primary text-white font-bold ring-2 ring-primary/20' 
                          : isPast
                            ? 'text-text-main bg-primary/10 border border-primary/20' 
                            : 'text-text-muted/40 bg-bg-base/30'
                      }`}
                      title={isToday ? "Active today!" : ""}
                    >
                      {day}
                      {isToday && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-secondary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Victory History Logs */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border-card pb-2">
                <Calendar className="w-4.5 h-4.5 text-text-muted" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main">
                  Recent Accomplishments
                </h3>
              </div>

              {/* Chronicles list */}
              {solvedProblems.length === 0 ? (
                <p className="text-xs text-text-muted font-mono text-center py-6">
                  No solved questions history found. Solve a challenge to start!
                </p>
              ) : (
                <div className="flex flex-col gap-3 font-sans text-xs relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-border-card/65">
                  {solvedProblems.map((prob) => {
                    return (
                      <div key={prob.id} className="flex gap-4 items-start relative z-10">
                        <div className="w-6 h-6 rounded-full bg-hover border border-border-card/50 text-text-main flex items-center justify-center flex-shrink-0 text-[10px] shadow-xs">
                          ✓
                        </div>
                        <div className="flex flex-col gap-1 bg-hover/40 p-3 rounded-lg border border-border-card/45 flex-1">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-primary font-mono">CHALLENGE SOLVED</span>
                            <span className="text-text-muted font-mono">July 9, 2026</span>
                          </div>
                          <span className="text-xs font-bold text-text-main mt-0.5">
                            {prob.title}
                          </span>
                          <p className="text-[10px] text-text-muted leading-relaxed mt-0.5 font-semibold">
                            Earned +{prob.difficulty === 'Easy' ? 100 : prob.difficulty === 'Medium' ? 200 : 400} XP and +{prob.difficulty === 'Easy' ? 15 : prob.difficulty === 'Medium' ? 30 : 60} Gold.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

          </div>
        </div>

    </AppLayout>
  );
}
