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
  Swords
} from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { PROBLEMS_DATA, TOPIC_TAGS, COMPANIES_LIST } from '../data/data';
import { useGameState, getXpForNextLevel } from '../lib/gameState';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'acceptance' | 'difficulty'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Consume gamified state context
  const { theme, userName, level, xp, gold, streak, toggleProblemCompletion } = useGameState();

  // Dynamic Daily Challenge (First unsolved problem)
  const activeQuest = useMemo(() => {
    return PROBLEMS_DATA.find(p => !solvedProblemIds.includes(p.id)) || PROBLEMS_DATA[0];
  }, [solvedProblemIds]);

  // Recommended Problems List (3 unsolved ones with tags)
  const recommendedProblems = useMemo(() => {
    return PROBLEMS_DATA.filter(p => !solvedProblemIds.includes(p.id)).slice(0, 3);
  }, [solvedProblemIds]);

  // Filter & Sort logic
  const filteredProblems = useMemo(() => {
    return PROBLEMS_DATA.filter((prob) => {
      const matchesSearch = prob.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            prob.id.toString() === searchTerm.trim();
      const matchesTopic = !selectedTopic || prob.topics.includes(selectedTopic);
      const matchesDifficulty = !selectedDifficulty || prob.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'All Topics' || prob.category === selectedCategory;
      const matchesCompany = !selectedCompany || prob.companies.some(c => c.name === selectedCompany);

      return matchesSearch && matchesTopic && matchesDifficulty && matchesCategory && matchesCompany;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.id - b.id;
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'acceptance') {
        comparison = parseFloat(a.acceptance) - parseFloat(b.acceptance);
      } else if (sortBy === 'difficulty') {
        const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        comparison = order[a.difficulty] - order[b.difficulty];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchTerm, selectedTopic, selectedDifficulty, selectedCategory, selectedCompany, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE));
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
    return filteredProblems.slice(start, start + PROBLEMS_PER_PAGE);
  }, [filteredProblems, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, -1, totalPages];
    if (currentPage >= totalPages - 3) return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages];
  }, [currentPage, totalPages]);

  const handleSort = (field: 'id' | 'title' | 'acceptance' | 'difficulty') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

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
    { rank: 3, name: userProfile?.name || userName || 'You', score: 1000 + xp, country: '🇮🇳', streak: streak, isUser: true },
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
    <div className="flex flex-col gap-6 w-full font-sans max-w-[1200px] mx-auto select-none">
      
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-border-card bg-gradient-to-r from-bg-card to-hover/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
        <div className="flex flex-col gap-1.5 max-w-lg relative z-10">
          <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider">Coding Arena v1.2</span>
          <h2 className="text-xl font-bold text-text-main tracking-tight leading-snug">Welcome back, {userProfile?.name || userName || 'Coder'}.</h2>
          <p className="text-xs text-text-muted leading-relaxed font-semibold">Consistency is key. Revisit your roadmaps or solve today's challenge to secure your daily points.</p>
          <div className="flex gap-2.5 mt-2">
            <Button variant="primary" size="sm" onClick={() => onSelectProblem(activeQuest.id)} className="flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-white" /> <span>Continue Coding</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.push(`/journey/frontend`)}>
              <span>View Roadmaps</span>
            </Button>
          </div>
        </div>

        <div className="bg-bg-card border border-border-card rounded-xl p-4 flex flex-col gap-3 w-full md:w-56 shadow-xs shrink-0">
          <div className="flex justify-between items-center text-xs font-semibold text-text-main border-b border-border-card/50 pb-1.5">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" /> Streak</span>
            <span className="text-orange-500 font-bold font-mono">{streak} days</span>
          </div>
          <div className="flex flex-col gap-1 text-[10px] font-semibold text-text-muted">
            <div className="flex justify-between"><span>Weekly target</span><span>{solvedProblemIds.length % 5}/5 solved</span></div>
            <div className="w-full h-1 bg-hover rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${((solvedProblemIds.length % 5) / 5) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Challenges Solved', val: solvedProblemIds.length, icon: CheckCircle2, sub: 'Rank tracking' },
          { title: 'Accumulated XP', val: `${xp} XP`, icon: Sparkles, sub: 'Level Up' },
          { title: 'Platform Gold', val: gold, icon: Coins, sub: 'Shop items' },
          { title: 'Global Rank', val: '#1,248', icon: Trophy, sub: 'Top 5%' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-bg-card border border-border-card rounded-xl p-4.5 flex items-center justify-between gap-3 shadow-xs hover:border-primary/20 transition-all duration-200">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-text-muted truncate">{card.title}</span>
                <h3 className="text-lg font-bold text-text-main tracking-tight font-mono leading-none mt-1">{card.val}</h3>
                <span className="text-[9px] text-text-muted mt-1.5 truncate">{card.sub}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-hover border border-border-card/45 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-text-muted" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Daily Quest */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div onClick={() => onSelectProblem(activeQuest.id)} className="md:col-span-2 group border border-border-card bg-bg-card rounded-xl p-5 shadow-xs cursor-pointer hover:border-primary/20 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-hover flex items-center justify-center border border-border-card/45"><Zap className="w-3.5 h-3.5 text-primary" /></div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Featured Daily Quest</span>
            </div>
            <h4 className="text-sm font-bold tracking-tight text-text-main group-hover:text-primary transition-colors mt-1.5">{activeQuest.title}</h4>
            <p className="text-[11px] text-text-muted font-semibold mt-1">Solve today's challenge to maintain your points streak.</p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-primary mt-4 font-bold font-mono">
            <span>Solve challenge now</span> <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="bg-bg-card border border-border-card rounded-xl p-5 flex flex-col gap-3 shadow-xs justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-hover flex items-center justify-center border border-border-card/45 shrink-0"><Sparkles className="w-3.5 h-3.5 text-primary" /></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-wider">AI Recommendation</span>
              <h4 className="text-[11px] font-bold text-text-main mt-0.5">Two Pointers Method</h4>
            </div>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed font-semibold">
            "When analyzing complex array elements, consider starting with the **Two Pointers** approach. It reduces time complexity from $O(N^2)$ to $O(N)$."
          </p>
          <div className="text-[9px] text-text-muted font-mono font-bold mt-1">Tip of the day</div>
        </div>
      </div>

      {/* 4. Language Course Progress (Router Pages Tracking) */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-1.5">Language Course Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'C++', total: 10, color: 'border-cyan-500/20 text-cyan-600 bg-cyan-500/5', barColor: 'bg-cyan-500' },
            { name: 'Python', total: 8, color: 'border-blue-500/20 text-blue-600 bg-blue-500/5', barColor: 'bg-blue-500' },
            { name: 'Java', total: 12, color: 'border-orange-500/20 text-orange-600 bg-orange-500/5', barColor: 'bg-orange-500' },
            { name: 'JavaScript', total: 6, color: 'border-amber-500/20 text-amber-600 bg-amber-500/5', barColor: 'bg-amber-500' },
          ].map((lang) => {
            const progressPercent = Math.min(100, Math.floor((solvedProblemIds.length / lang.total) * 100));
            return (
              <Link 
                key={lang.name}
                href={`/prepare/${lang.name.toLowerCase().replace('c++', 'cpp')}`}
                className="flex flex-col gap-3.5 p-4 rounded-xl border border-border-card/60 bg-bg-card shadow-xs hover:scale-[1.012] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border ${lang.color}`}>{lang.name}</span>
                  <span className="text-[10px] font-mono text-text-muted font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-1 bg-hover rounded-full overflow-hidden">
                  <div className={`h-full ${lang.barColor} rounded-full`} style={{ width: `${progressPercent}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Contests & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-card/65 pt-5">
        <Link href="/test-arena" className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs hover:border-primary/20 transition-all">
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5 mb-3"><Trophy className="w-4 h-4 text-primary" /> Upcoming Contests</h4>
          <div className="flex flex-col gap-2.5">
            {upcomingContests.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-main truncate">{c.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-text-muted font-mono">{c.time}</span>
                  {c.reward && <Badge variant="hard">+{c.reward}</Badge>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] font-mono font-bold text-primary flex items-center gap-1">View all contests <ArrowRight className="w-3 h-3" /></div>
        </Link>

        <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5 mb-3"><Award className="w-4 h-4 text-primary" /> Global Leaderboard</h4>
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className={`flex items-center justify-between text-xs py-1 px-2 rounded ${entry.isUser ? 'bg-primary/10 border border-primary/20' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-muted w-4">#{entry.rank}</span>
                  <span className="font-bold text-text-main">{entry.name}</span>
                  {entry.isUser && <Badge variant="easy">You</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-text-muted">{entry.country}</span>
                  <span className="font-mono font-bold text-text-main">{entry.score.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Core Library Filters & Table View */}
      <div className="flex flex-col gap-4 border-t border-border-card/65 pt-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card p-4 rounded-xl border border-border-card shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {['All Topics', 'Algorithms', 'Data Structures', 'Database'].map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                className={`text-[11px] font-mono font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg border transition-all ${
                  selectedCategory === category ? 'bg-primary text-white border-primary' : 'bg-bg-base text-text-muted border-border-card/70'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-main"
            />
          </div>
        </div>

        {/* Problems Table Rendering */}
        <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-border-card bg-bg-base/30 text-text-muted text-[10px] font-mono font-bold uppercase select-none">
                  <th className="py-3.5 px-4 w-14 text-center">Status</th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('title')}>Title</th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('difficulty')}>Difficulty</th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('acceptance')}>Acceptance</th>
                  <th className="py-3.5 px-4 w-28 text-center">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/30">
                {paginatedProblems.map((prob) => {
                  const isSolved = solvedProblemIds.includes(prob.id);
                  return (
                    <tr key={prob.id} onClick={() => onSelectProblem(prob.id)} className="hover:bg-hover/20 border-b border-border-card/20 last:border-0 transition-all duration-100 group cursor-pointer">
                      <td 
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProblemCompletion(prob.id);
                        }}
                      >
                        <div className="flex items-center justify-center cursor-pointer">
                          {isSolved ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <div className="w-4 h-4 rounded-full border border-border-card" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[12.5px] font-bold text-text-main group-hover:text-primary transition-colors">{prob.id}. {prob.title}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Medium' ? 'medium' : 'hard'}>{prob.difficulty}</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted">{prob.acceptance}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[9.5px] font-mono font-bold text-text-muted bg-hover/40 px-2 py-0.5 rounded border border-border-card/45">{prob.category}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7. Metrics Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-card/65 pt-5">
        <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Weekly Practice Output</h4>
          <div className="w-full h-48 mt-2">
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

        <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5"><Award className="w-4 h-4" /> Distribution by Difficulty</h4>
          <div className="w-full h-48 mt-2 flex items-center justify-center">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={difficultyDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                    {difficultyDistribution.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
