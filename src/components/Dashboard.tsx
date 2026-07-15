'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Calendar, 
  Award, 
  SlidersHorizontal, 
  Compass, 
  Sparkles, 
  Coins,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Trophy,
  Zap,
  Flame,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Lock,
  BadgeCheck,
  FileBadge,
  Swords,
  Pencil,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { PROBLEMS_DATA, TOPIC_TAGS, COMPANIES_LIST } from '../data/data';
import { useGameState, getXpForNextLevel } from '../lib/gameState';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

// Recharts components imported dynamically on client side
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface UserProfileData {
  name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  provider: string | null;
}

interface DashboardProps {
  userProfile?: UserProfileData | null;
  solvedProblemIds: number[];
  onSelectProblem: (id: number) => void;
}

const PROBLEMS_PER_PAGE = 25;

export default function Dashboard({ userProfile = null, solvedProblemIds, onSelectProblem }: DashboardProps) {
  const [liveContests, setLiveContests] = useState<Array<{ name: string; time: string; reward: string }>>([]);

  useEffect(() => {
    fetch('/api/contests')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const published = (data as Array<Record<string, unknown>>).filter((c) => c.isPublished);
        const mapped = published.map((c: Record<string, unknown>) => ({
          name: c.title as string,
          time: c.startsAt
            ? new Date(c.startsAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : `${(c.durationMins as number) || 60} min`,
          reward: `${(c.maxPoints as number) || 0} pts`,
        }));
        setLiveContests(mapped.slice(0, 3));
      })
      .catch(() => {});
  }, []);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Consume gamified state context
  const { theme, userName, level, xp, gold, streak, updateUserName } = useGameState();

  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.name || userName || 'Coder');
  }, [userProfile, userName]);

  const handleSaveName = async () => {
    const trimmed = tempName.trim();
    if (!trimmed) return;
    setIsSavingName(true);
    try {
      // 1. Update in Supabase profiles table
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const { error } = await supabase
          .from('profiles')
          .update({ name: trimmed })
          .eq('id', session.user.id);
        if (error) {
          console.error('Error updating name in Supabase:', error);
        }
      }
      
      // 2. Update in GameState context
      updateUserName(trimmed);
      
      // 3. Update local state
      setDisplayName(trimmed);
      setIsEditingName(false);
    } catch (err) {
      console.error('Error saving name:', err);
    } finally {
      setIsSavingName(false);
    }
  };

  // Dynamic Daily Challenge (First unsolved problem)
  const activeQuest = useMemo(() => {
    return PROBLEMS_DATA.find(p => !solvedProblemIds.includes(p.id)) || PROBLEMS_DATA[0];
  }, [solvedProblemIds]);

  // Charts Mock Data
  const weeklyData = [
    { day: 'Mon', solved: 2 }, { day: 'Tue', solved: 4 }, { day: 'Wed', solved: 1 },
    { day: 'Thu', solved: 5 }, { day: 'Fri', solved: 3 }, { day: 'Sat', solved: 0 }, { day: 'Sun', solved: 2 }
  ];

  const difficultyDistribution = [
    { name: 'Easy', value: solvedProblemIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Easy').length, color: '#00C853' },
    { name: 'Medium', value: solvedProblemIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Medium').length, color: '#D97706' },
    { name: 'Hard', value: solvedProblemIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Hard').length, color: '#DC2626' }
  ];

  const leaderboard = [
    { rank: 1, name: 'algo_sorcerer', score: 3480, country: '🇺🇸', streak: 42 },
    { rank: 2, name: 'callback_hero', score: 2950, country: '🇬🇧', streak: 18 },
    { rank: 3, name: displayName || 'You', score: 1000 + xp, country: '🇮🇳', streak: streak, isUser: true },
    { rank: 4, name: 'byte_cruncher', score: 940, country: '🇨🇦', streak: 9 },
    { rank: 5, name: 'kernel_guru', score: 810, country: '🇩🇪', streak: 4 }
  ];

  const achievements = [
    { id: 'first_sub', title: 'First Semicolon', desc: 'Compile your very first solution.', emoji: '🚀', isUnlocked: solvedProblemIds.length > 0 },
    { id: 'streak_5', title: 'Streak Legend', desc: 'Maintain a 5-day coding streak.', emoji: '🔥', isUnlocked: streak >= 5 },
    { id: 'easy_rider', title: 'Easy Rider', desc: 'Solve 10 Easy-level problems.', emoji: '🟢', isUnlocked: solvedProblemIds.length >= 5 },
    { id: 'quantum_coder', title: 'Quantum Solver', desc: 'Solve 50 coding problems.', emoji: '⚛️', isUnlocked: false },
    { id: 'master_sql', title: 'Query Master', desc: 'Unlock Distributed DB achievements.', emoji: '💾', isUnlocked: false },
    { id: 'ai_partner', title: 'Partner in Code', desc: 'Consult your Developer Companion Pet.', emoji: '🤖', isUnlocked: true }
  ];

  const timelineEvents = [
    { type: 'solve', title: 'Solved "Two Sum"', desc: 'Optimized search time complexity using Hash Tables.', time: '2 hours ago' },
    { type: 'badge', title: 'Unlocked "Streak Legend" Title', desc: 'Reached Developer Level 5 milestone.', time: '1 day ago' },
    { type: 'gold', title: 'Earned 30 Gold Coins', desc: 'Bonus reward for consecutive coding streak.', time: '3 days ago' },
    { type: 'journey', title: 'Started "ML Engineer" Roadmap', desc: 'Enrolled in basic data preprocessing tracks.', time: '1 week ago' }
  ];

  const learningCourses = [
    { title: 'Graph Algorithms & Traversals', progress: 75, difficulty: 'Medium', time: '1.5 hours left', icon: Compass },
    { title: 'Distributed Systems & Sockets', progress: 30, difficulty: 'Hard', time: '4 hours left', icon: Swords },
    { title: 'Neural Networks Architecture', progress: 92, difficulty: 'Hard', time: '15 mins left', icon: Sparkles },
    { title: 'Advanced CSS Layouts & Flex', progress: 10, difficulty: 'Easy', time: '3 hours left', icon: Clock }
  ];

  const upcomingContests = liveContests.length > 0
    ? liveContests
    : [{ name: 'No contests yet', time: 'Create one in admin', reward: '' }];
  return (
    <div className="flex flex-col gap-10 w-full font-sans max-w-[1200px] mx-auto select-none pb-12">
      
      {/* 1. Welcome Hero & 2. Daily Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Welcome Hero (2/3 width) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border-card/25 p-8 flex flex-col justify-between gap-6 shadow-card-custom min-h-[320px] lg:h-[340px] group cursor-default transition-all duration-300 hover:shadow-lg">
          {/* Landscape Background Illustration with smooth zoom effect */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src="/scenic_sunset.png" 
              alt="Backdrop" 
              loading="lazy"
              className="w-full h-full object-cover opacity-65 brightness-110 contrast-110 group-hover:scale-103 transition-transform duration-700 ease-out select-none pointer-events-none"
            />
            {/* Dynamic themed overlays & vignette */}
            <div className="absolute inset-0 bg-[var(--color-hero-overlay)]" />
            <div className="absolute inset-0 bg-[var(--color-hero-gradient)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.3)_100%)] mix-blend-multiply" />
          </div>

          <div className="flex flex-col gap-2.5 relative z-10 text-white text-left w-full">
            <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider flex items-center gap-1.5 drop-shadow-sm select-none">
              <Zap className="w-3.5 h-3.5 fill-primary" /> Incuxai Code Arena v1.2
            </span>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1 relative z-20">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-black/50 border border-white/30 text-white px-3 py-1.5 rounded-lg text-lg font-bold focus:outline-none focus:border-primary max-w-[200px]"
                  placeholder="Enter name..."
                  autoFocus
                  disabled={isSavingName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="p-1.5 rounded bg-primary hover:bg-primary/95 text-white disabled:opacity-50 cursor-pointer flex items-center justify-center border-0"
                  title="Save Name"
                >
                  {isSavingName ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  disabled={isSavingName}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer flex items-center justify-center border-0"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h2 className="text-3xl font-black tracking-tight leading-none drop-shadow-md select-none flex items-center gap-2 group/name">
                <span>Welcome back, {displayName}! 👋</span>
                <button
                  onClick={() => {
                    setTempName(displayName === 'Coder' ? '' : displayName);
                    setIsEditingName(true);
                  }}
                  className="p-1 rounded bg-white/0 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer opacity-0 group-hover/name:opacity-100 focus:opacity-100 flex items-center justify-center border-0"
                  title="Edit name"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </h2>
            )}
            <p className="text-[12.5px] text-zinc-200 leading-relaxed font-medium max-w-sm drop-shadow-sm">
              Consistency is key. Revisit your roadmaps or solve today's challenge to secure your daily points.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-2 relative z-10">
            <div className="flex gap-3">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onSelectProblem(activeQuest.id)} 
                className="flex items-center gap-1.5 cursor-pointer shadow-md bg-primary hover:bg-primary/95 text-white border-0"
              >
                <Play className="w-3 h-3 fill-white" /> <span>Continue Coding</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => router.push(`/journey/frontend`)} 
                className="cursor-pointer bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
              >
                <span>View Roadmaps</span>
              </Button>
            </div>
            {/* Daily Streak Indicator */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/15 px-3 py-1.5 rounded-lg select-none backdrop-blur-md">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10 animate-pulse" />
              <div className="flex flex-col leading-none text-left">
                <span className="text-[9px] font-mono text-zinc-400 font-bold">STREAK</span>
                <span className="text-xs font-mono font-bold text-white">{streak} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Challenge (1/3 width) */}
        <div className="lg:col-span-1 bg-elevated border border-border-card/45 rounded-2xl p-6 shadow-card-custom flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" /> Today's Challenge
              </span>
              <Badge variant={activeQuest.difficulty === 'Easy' ? 'easy' : activeQuest.difficulty === 'Medium' ? 'medium' : 'hard'}>
                {activeQuest.difficulty}
              </Badge>
            </div>
            <h3 className="text-[13.5px] font-bold tracking-tight text-text-main mt-3 leading-snug truncate">
              {activeQuest.id}. {activeQuest.title}
            </h3>
            <p className="text-[11px] text-text-muted mt-1 leading-relaxed font-semibold">
              Solve this challenge to earn points and maintain your streak.
            </p>
            <div className="text-[10px] font-mono font-bold text-text-muted mt-3.5 flex items-center gap-1">
              <span>Reward:</span>
              <span className="text-primary font-black">+50 XP</span>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => onSelectProblem(activeQuest.id)} className="w-full justify-center flex items-center gap-1.5 cursor-pointer mt-2">
            <span>Solve Now</span> <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 3. Language Learning Progress (Horizontal Scroll Cards) */}
      <div className="flex flex-col gap-4 w-full">
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-2">Language Learning Progress</h3>
        <div className="relative w-full">
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 snap-x scroll-smooth custom-scrollbar">
            {[
              { name: 'C++', total: 40, completed: 12, estLeft: '28 lessons left', lastUsed: 'Accessed 2h ago', diff: 'Medium', barColor: 'bg-primary shadow-[0_0_8px_rgba(0,122,51,0.35)]' },
              { name: 'Python', total: 30, completed: 18, estLeft: '12 lessons left', lastUsed: 'Accessed 1d ago', diff: 'Easy', barColor: 'bg-primary shadow-[0_0_8px_rgba(0,122,51,0.35)]' },
              { name: 'Java', total: 45, completed: 15, estLeft: '30 lessons left', lastUsed: 'Accessed 3d ago', diff: 'Hard', barColor: 'bg-primary shadow-[0_0_8px_rgba(0,122,51,0.35)]' },
              { name: 'JavaScript', total: 25, completed: 19, estLeft: '6 lessons left', lastUsed: 'Accessed 5h ago', diff: 'Easy', barColor: 'bg-primary shadow-[0_0_8px_rgba(0,122,51,0.35)]' },
              { name: 'SQL', total: 35, completed: 10, estLeft: '25 lessons left', lastUsed: 'Accessed 1w ago', diff: 'Easy', barColor: 'bg-primary shadow-[0_0_8px_rgba(0,122,51,0.35)]' },
              { name: 'React', total: 50, completed: 25, estLeft: '25 lessons left', lastUsed: 'Accessed 4d ago', diff: 'Medium', barColor: 'bg-primary shadow-[0_0_8px_rgba(0,122,51,0.35)]' },
              { name: 'Node.js', total: 38, completed: 8, estLeft: '30 lessons left', lastUsed: 'Accessed 2w ago', diff: 'Hard', barColor: 'bg-primary shadow-[0_0_8px_rgba(0,122,51,0.35)]' }
            ].map((lang) => {
              const progressPercent = Math.min(100, Math.floor((lang.completed / lang.total) * 100));
              return (
                <div 
                  key={lang.name}
                  className="snap-start flex-none w-[280px] flex flex-col justify-between gap-5 p-6 rounded-2xl border border-border-card bg-bg-card shadow-card-custom hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20 transition-all duration-300 select-none group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col leading-none">
                        <h4 className="text-[13.5px] font-black text-text-main group-hover:text-primary transition-colors">{lang.name}</h4>
                        <span className="text-[9px] text-text-muted font-mono font-bold mt-1 uppercase">{lang.lastUsed}</span>
                      </div>
                    </div>
                    <Badge variant={lang.diff === 'Easy' ? 'easy' : lang.diff === 'Medium' ? 'medium' : 'hard'}>
                      {lang.diff}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted">
                      <span>{lang.completed}/{lang.total} lessons</span>
                      <span className="text-text-main">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-hover rounded-full overflow-hidden">
                      <div className={`h-full ${lang.barColor} rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="text-[9.5px] text-text-muted font-mono font-bold mt-1 leading-none">{lang.estLeft}</span>
                  </div>

                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => router.push(`/prepare/${lang.name.toLowerCase().replace('c++', 'cpp').replace('.js', '')}`)}
                    className="w-full justify-center flex items-center gap-1 cursor-pointer"
                  >
                    <span>Continue Learning</span> <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Continue Learning */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-2">Continue Learning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Graph Algorithms & Traversals', lessonsDone: 15, lessonsTotal: 20, timeSpent: '4.5 hours spent', diff: 'Medium', lastAccessed: 'Last accessed 2 hours ago', icon: Compass },
            { title: 'Distributed Systems & Sockets', lessonsDone: 6, lessonsTotal: 20, timeSpent: '12 hours spent', diff: 'Hard', lastAccessed: 'Last accessed 1 day ago', icon: Swords }
          ].map((course, idx) => {
            const Icon = course.icon;
            const progressPercent = Math.floor((course.lessonsDone / course.lessonsTotal) * 100);
            return (
              <div 
                key={idx} 
                onClick={() => router.push('/journey/frontend')}
                className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs hover:border-primary/20 hover:shadow-sm transition-all flex justify-between items-center gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-hover border border-border-card/45 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-text-muted" />
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <h4 className="text-[12.5px] font-bold text-text-main truncate">{course.title}</h4>
                    <span className="text-[9px] text-text-muted font-mono font-bold mt-1 uppercase">{course.lastAccessed}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant={course.diff === 'Easy' ? 'easy' : course.diff === 'Medium' ? 'medium' : 'hard'}>{course.diff}</Badge>
                  <span className="text-[10px] font-mono font-bold text-text-muted">{progressPercent}% done</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Weekly Practice Output */}
      <div className="bg-bg-card border border-border-card rounded-xl p-6 shadow-xs flex flex-col gap-4">
        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary" /> Weekly Coding Activity
        </h4>
        <div className="w-full h-56 mt-2">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-card)', fontSize: '10px' }} />
                <Bar dataKey="solved" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
