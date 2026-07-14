'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { useGameState, getXpForNextLevel } from '@/src/lib/gameState';
import { PROBLEMS_DATA } from '@/src/data/data';
import CompanionPet from '@/src/components/dashboard/CompanionPet';
import { supabase } from '@/src/utils/supabaseClient';
import { 
  Award, Coins, Flame, Lock, ArrowLeft, Check, TrendingUp, Calendar, Pencil, BadgeCheck, Target, BookOpen, Zap, BarChart3, User, Settings, Activity, Mail, Trash2, CalendarDays, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

const AVATAR_OPTIONS = [
  { id: 'sherlock', name: 'Sherlock Holmes', emoji: '🕵️', desc: 'Analytical master of debug traces.', gradient: 'from-amber-500 to-orange-600', req: 1 },
  { id: 'neo', name: 'Neo', emoji: '🕶️', desc: 'Bypasses firewalls and bends rules.', gradient: 'from-slate-600 to-slate-900', req: 2 },
  { id: 'yoda', name: 'Master Yoda', emoji: '🧙', desc: 'Senior developer mastering recursion.', gradient: 'from-emerald-500 to-teal-600', req: 3 },
  { id: 'stark', name: 'Tony Stark', emoji: '🦾', desc: 'Builds complex compiler rigs.', gradient: 'from-red-500 to-yellow-500', req: 4 },
];

const TITLES_CONFIG = [
  { name: 'Bug Rookie', reqLevel: 1, icon: '🐣' },
  { name: 'Semicolon Survivor', reqLevel: 3, icon: '🩹' },
  { name: 'Callback Crusader', reqLevel: 5, icon: '⚔️' },
  { name: 'O(1) Sorcerer', reqLevel: 8, icon: '🧙' },
  { name: 'Kernel Conqueror', reqLevel: 12, icon: '👑' },
];

const ACHIEVEMENTS_LIST = [
  { id: 'First Semicolon', title: 'First Semicolon', desc: 'Solve your first problem', emoji: '💾' },
  { id: 'Code Crusader', title: 'Code Crusader', desc: 'Solve 5 problems', emoji: '🛡️' },
  { id: 'Dragon Slayer', title: 'Dragon Slayer', desc: 'Solve a Hard problem', emoji: '🐉' },
  { id: 'Streak Legend', title: 'Streak Legend', desc: '7-day streak', emoji: '🔥' },
  { id: 'Pet Stylist', title: 'Pet Stylist', desc: 'Customize Byte', emoji: '👒' },
  { id: 'High Level Coder', title: 'High Level Coder', desc: 'Reach level 5', emoji: '🎓' },
  { id: 'Century Club', title: 'Century Club', desc: 'Solve 100 problems', emoji: '🏆' },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'customize', label: 'Customize', icon: Settings },
];

const RADAR_CENTER = 110;
const RADAR_MAX_R = 82;
const ANGLES = [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6, (-5 * Math.PI) / 6];
const ATTRIBUTE_NAMES = ['Algorithms', 'Categories', 'Topics', 'Streak', 'Style', 'Speed'];

function hexPts(scale: number) {
  return ANGLES.map(a => {
    const r = RADAR_MAX_R * scale;
    return `${RADAR_CENTER + r * Math.cos(a)},${RADAR_CENTER + r * Math.sin(a)}`;
  }).join(' ');
}

export default function ProfilePage() {
  const { userName, level, xp, gold, streak, title, avatar, solvedIds, petAccessories, unlockedTitles, unlockedAchievements, profilePicture, updateUserName, updateTitle, updateAvatar, updateProfilePicture } = useGameState();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setUserEmail(session.user.email);
    });
  }, []);

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) updateProfilePicture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = () => {
    updateProfilePicture('');
  };

  const solvedProblems = useMemo(() => PROBLEMS_DATA.filter(p => solvedIds.includes(p.id)), [solvedIds]);
  const solvedBreakdown = useMemo(() => ({
    easy: solvedProblems.filter(p => p.difficulty === 'Easy').length,
    medium: solvedProblems.filter(p => p.difficulty === 'Medium').length,
    hard: solvedProblems.filter(p => p.difficulty === 'Hard').length,
  }), [solvedProblems]);

  const totalSolved = solvedBreakdown.easy + solvedBreakdown.medium + solvedBreakdown.hard;

  const attributes = useMemo(() => {
    const s1 = Math.min(100, 30 + solvedBreakdown.easy * 10 + solvedBreakdown.medium * 15 + solvedBreakdown.hard * 30);
    const cats = new Set(solvedProblems.map(p => p.category)).size;
    const s2 = Math.min(100, 20 + cats * 25);
    const tops = new Set(solvedProblems.flatMap(p => p.topics)).size;
    const s3 = Math.min(100, 15 + tops * 15);
    const s4 = Math.min(100, 25 + streak * 10);
    const s5 = Math.min(100, 20 + petAccessories.length * 20 + Math.floor(gold / 2));
    const avg = solvedProblems.length > 0 ? Math.floor(solvedProblems.reduce((s, p) => s + parseFloat(p.acceptance), 0) / solvedProblems.length) : 53;
    const s6 = Math.min(100, 30 + avg);
    return [s1, s2, s3, s4, s5, s6];
  }, [solvedBreakdown, solvedProblems, streak, gold, petAccessories]);

  const radarPts = useMemo(() => attributes.map((v, i) => {
    const r = (v / 100) * RADAR_MAX_R;
    return `${RADAR_CENTER + r * Math.cos(ANGLES[i])},${RADAR_CENTER + r * Math.sin(ANGLES[i])}`;
  }).join(' '), [attributes]);

  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === avatar) || AVATAR_OPTIONS[0];

  const handleSaveName = () => {
    if (tempName.trim()) { updateUserName(tempName.trim()); setIsEditingName(false); }
  };

  const handleEquipTitle = (t: string) => {
    if (unlockedTitles.includes(t)) updateTitle(t);
  };

  const calendarDays = useMemo(() => {
    const arr: (number | null)[] = [null, null, null];
    for (let i = 1; i <= 31; i++) arr.push(i);
    return arr;
  }, []);

  const tabContent = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return (
          <div className="space-y-5">
            {/* Row 1: Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-bg-card border border-border-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-main leading-tight">{totalSolved}</div>
                  <div className="text-[10px] text-text-muted font-medium mt-0.5">Problems Solved</div>
                </div>
              </div>
              <div className="bg-bg-card border border-border-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-main leading-tight">{streak}d</div>
                  <div className="text-[10px] text-text-muted font-medium mt-0.5">Current Streak</div>
                </div>
              </div>
              <div className="bg-bg-card border border-border-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-main leading-tight">{gold}</div>
                  <div className="text-[10px] text-text-muted font-medium mt-0.5">Gold Earned</div>
                </div>
              </div>
              <div className="bg-bg-card border border-border-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-main leading-tight">Lv.{level}</div>
                  <div className="text-[10px] text-text-muted font-medium mt-0.5">{xp} / {getXpForNextLevel(level)} XP</div>
                </div>
              </div>
            </div>

            {/* Row 2: Skills + Difficulty Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Skill Radar */}
              <div className="bg-bg-card border border-border-card rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5 mb-4"><Zap className="w-3.5 h-3.5 text-text-muted" />Skill Radar</h3>
                <div className="flex flex-col items-center">
                  <svg width="200" height="200" viewBox="0 0 220 220" className="w-40 h-40 md:w-48 md:h-48">
                    {[0.25, 0.5, 0.75, 1].map(s => (
                      <polygon key={s} points={hexPts(s)} fill="none" stroke="var(--color-border-card)" strokeWidth="0.6" opacity={s === 1 ? 0.4 : 0.2} />
                    ))}
                    {ANGLES.map((a, i) => (
                      <line key={i} x1={RADAR_CENTER} y1={RADAR_CENTER} x2={RADAR_CENTER + RADAR_MAX_R * Math.cos(a)} y2={RADAR_CENTER + RADAR_MAX_R * Math.sin(a)} stroke="var(--color-border-card)" strokeWidth="0.6" opacity="0.15" />
                    ))}
                    <polygon points={radarPts} fill="var(--color-primary)" fillOpacity="0.08" stroke="var(--color-primary)" strokeWidth="1.2" className="transition-all duration-700" />
                    {attributes.map((v, i) => {
                      const r = (v / 100) * RADAR_MAX_R;
                      return <circle key={i} cx={RADAR_CENTER + r * Math.cos(ANGLES[i])} cy={RADAR_CENTER + r * Math.sin(ANGLES[i])} r="2.5" fill="var(--color-primary)" stroke="var(--color-bg-card)" strokeWidth="1.5" className="transition-all duration-700" />;
                    })}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3">
                  {ATTRIBUTE_NAMES.map((name, i) => (
                    <div key={name} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      <span className="text-text-muted">{name}</span>
                      <span className="text-text-main font-bold ml-auto">{attributes[i]}<span className="text-text-muted font-normal">%</span></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="bg-bg-card border border-border-card rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5 mb-4"><BarChart3 className="w-3.5 h-3.5 text-text-muted" />Difficulty Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Easy', count: solvedBreakdown.easy, color: 'bg-green-500', textColor: 'text-green-400', bgColor: 'bg-green-500/10' },
                    { label: 'Medium', count: solvedBreakdown.medium, color: 'bg-yellow-500', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
                    { label: 'Hard', count: solvedBreakdown.hard, color: 'bg-red-500', textColor: 'text-red-400', bgColor: 'bg-red-500/10' },
                  ].map(item => {
                    const maxCount = Math.max(solvedBreakdown.easy, solvedBreakdown.medium, solvedBreakdown.hard, 1);
                    const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="font-semibold text-text-main">{item.label}</span>
                          </div>
                          <span className="text-text-main font-bold">{item.count}<span className="text-text-muted font-normal ml-0.5">problems</span></span>
                        </div>
                        <div className="w-full h-2 bg-hover rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalSolved > 0 && (
                  <div className="mt-5 pt-4 border-t border-border-card/50 flex justify-around text-center">
                    <div>
                      <div className="text-xs text-text-muted">Easy</div>
                      <div className="text-sm font-bold text-green-400">{Math.round((solvedBreakdown.easy / totalSolved) * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted">Medium</div>
                      <div className="text-sm font-bold text-yellow-400">{Math.round((solvedBreakdown.medium / totalSolved) * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted">Hard</div>
                      <div className="text-sm font-bold text-red-400">{Math.round((solvedBreakdown.hard / totalSolved) * 100)}%</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Topics Covered */}
            <div className="bg-bg-card border border-border-card rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5 mb-4"><BookOpen className="w-3.5 h-3.5 text-text-muted" />Topics Covered</h3>
              {solvedProblems.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">Solve your first problem to see topics here.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(solvedProblems.flatMap(p => p.topics))).sort().map(topic => (
                    <span key={topic} className="px-3 py-1.5 rounded-lg bg-hover border border-border-card/50 text-[11px] font-semibold text-text-main">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="bg-bg-card border border-border-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-text-muted" />Trophies</h3>
              <span className="text-[10px] text-text-muted font-mono">{unlockedAchievements.length}/{ACHIEVEMENTS_LIST.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ACHIEVEMENTS_LIST.map(ach => {
                const unlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div key={ach.id} className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${unlocked ? 'bg-bg-card border-border-card' : 'bg-bg-base/40 border-border-card/25 opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${unlocked ? 'bg-hover' : 'bg-bg-base border border-border-card/15'}`}>
                      {unlocked ? ach.emoji : <Lock className="w-3.5 h-3.5 text-text-muted/50" />}
                    </div>
                    <span className="text-[11px] font-bold text-text-main leading-tight">{ach.title}</span>
                    <span className="text-[9px] text-text-muted leading-snug">{ach.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="flex flex-col gap-5">
            <div className="bg-bg-card border border-border-card rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5 mb-3"><Calendar className="w-3.5 h-3.5 text-text-muted" />This Month</h3>
              <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-medium text-text-muted/50 mb-1.5">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={idx} />;
                  const isToday = day === 11;
                  const isPast = day < 11;
                  return (
                    <div key={idx} className={`aspect-square flex items-center justify-center rounded text-xs font-bold ${isToday ? 'bg-primary text-white' : isPast ? 'bg-primary/10 text-text-main' : 'text-text-muted/20 bg-bg-base/30'}`}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-bg-card border border-border-card rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5 mb-3"><BadgeCheck className="w-3.5 h-3.5 text-text-muted" />Recent Solves</h3>
              {totalSolved === 0 ? (
                <p className="text-xs text-text-muted text-center py-8">No solved problems yet.</p>
              ) : (
                <div className="space-y-2">
                  {solvedProblems.slice(0, 8).map(prob => (
                    <div key={prob.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-card/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-text-main truncate">{prob.title}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${prob.difficulty === 'Easy' ? 'text-easy bg-easy-bg' : prob.difficulty === 'Medium' ? 'text-medium bg-medium-bg' : 'text-hard bg-hard-bg'}`}>{prob.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'customize':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-bg-card border border-border-card rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-text-muted" />Avatar</h3>
              <div className="space-y-2">
                {AVATAR_OPTIONS.map(opt => {
                  const equipped = avatar === opt.id;
                  const locked = level < opt.req;
                  return (
                    <div key={opt.id} onClick={() => { if (!locked) updateAvatar(opt.id); }}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${equipped ? 'border-primary/30 bg-primary/5' : locked ? 'border-border-card/30 opacity-45 cursor-not-allowed' : 'border-border-card hover:border-border-card/70'}`}>
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${opt.gradient} p-[1px] shrink-0`}>
                        <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center text-xs font-bold text-text-main">{locked ? <Lock className="w-3 h-3 text-text-muted" /> : opt.name[0]}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-main">{opt.name}</span>
                          {locked ? <span className="text-[8px] font-mono text-text-muted border border-border-card rounded px-1">Lv.{opt.req}</span> : equipped ? <span className="text-[8px] text-primary font-semibold">Equipped</span> : null}
                        </div>
                        <p className="text-[9px] text-text-muted mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="bg-bg-card border border-border-card rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-main mb-3 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-text-muted" />Title</h3>
                <div className="space-y-1.5">
                  {TITLES_CONFIG.map(cfg => {
                    const equipped = title === cfg.name;
                    const unlocked = level >= cfg.reqLevel;
                    return (
                      <div key={cfg.name} onClick={() => { if (unlocked) handleEquipTitle(cfg.name); }}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${equipped ? 'border-primary/30 bg-primary/5' : unlocked ? 'border-border-card hover:border-border-card/70' : 'border-border-card/25 opacity-40 cursor-not-allowed'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cfg.icon}</span>
                          <span className="text-xs font-bold text-text-main">{cfg.name}</span>
                        </div>
                        {unlocked ? (equipped ? <span className="text-[8px] text-primary font-semibold">Equipped</span> : <span className="text-[8px] font-semibold text-text-muted border border-border-card rounded px-1.5 py-0.5">Equip</span>) : <span className="text-[8px] text-text-muted flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />Lv.{cfg.reqLevel}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <CompanionPet />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-card text-text-muted hover:text-text-main hover:bg-hover transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-text-main">Profile</h1>
          <p className="text-[11px] text-text-muted mt-0.5">Manage your developer identity and progress.</p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-bg-card border border-border-card rounded-xl p-6 mb-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative group shrink-0">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentAvatar.gradient} p-[2px]`}>
              <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-text-main select-none">
                    {(userName || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              <button onClick={() => fileInputRef.current?.click()}
                className="w-6 h-6 rounded-full bg-primary text-white border-2 border-bg-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-primary-hover shadow-sm"
                title="Upload photo">
                <Pencil className="w-3 h-3" />
              </button>
              {profilePicture && (
                <button onClick={handleRemovePicture}
                  className="w-6 h-6 rounded-full bg-rose-500 text-white border-2 border-bg-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-rose-600 shadow-sm"
                  title="Remove photo">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div>
                {isEditingName ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} maxLength={18}
                      className="bg-bg-base border border-border-card rounded px-2.5 py-1 text-sm font-semibold focus:outline-none focus:border-primary text-text-main w-36" autoFocus />
                    <button onClick={handleSaveName} className="text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors">Save</button>
                    <button onClick={() => { setIsEditingName(false); setTempName(userName); }} className="text-[11px] text-text-muted hover:text-text-main transition-colors">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-bold text-text-main">{userName}</h2>
                    <button onClick={() => { setIsEditingName(true); setTempName(userName); }} className="text-text-muted hover:text-text-main transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-muted">
                <span className="text-primary font-semibold">{title}</span>
                <span>·</span>
                <span>Level {level}</span>
              </div>
            </div>

            {/* Student Details */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
              {userEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {userEmail}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                {totalSolved} Problems Solved
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {solvedBreakdown.easy}E / {solvedBreakdown.medium}M / {solvedBreakdown.hard}H
              </span>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-text-muted">Experience</span>
                <span className="text-text-muted font-mono">{xp} / {getXpForNextLevel(level)} XP</span>
              </div>
              <div className="w-full h-2 bg-hover rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.floor((xp / getXpForNextLevel(level)) * 100))}%` }} />
              </div>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2.5 bg-bg-base border border-border-card rounded-lg px-4 py-2.5">
              <Coins className="w-4 h-4 text-yellow-500" />
              <div>
                <div className="text-sm font-bold text-text-main leading-tight">{gold}</div>
                <div className="text-[9px] text-text-muted font-medium">Gold</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-bg-base border border-border-card rounded-lg px-4 py-2.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-sm font-bold text-text-main leading-tight">{streak}</div>
                <div className="text-[9px] text-text-muted font-medium">Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-card/50 mb-5 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 pb-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${activeTab === tab.id ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-main'}`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {tabContent(activeTab)}
        </motion.div>
      </AnimatePresence>

    </AppLayout>
  );
}
