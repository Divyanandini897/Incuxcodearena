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
  Award,
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

interface DashboardProps {
  solvedProblemIds: number[];
  onSelectProblem: (id: number) => void;
}

const PROBLEMS_PER_PAGE = 25;

const CAREER_ROLES = [
  {
    id: 'system',
    title: 'System Engineer',
    desc: 'Master OS internals, files handling, sockets concurrency, and distributed system architectures.',
    color: 'border-cyan-500/30 text-cyan-600 bg-cyan-500/5',
  },
  {
    id: 'ml',
    title: 'ML Engineer',
    desc: 'Master data cleaning scripts, predictor training, and neural networks tuning.',
    color: 'border-blue-500/30 text-blue-600 bg-blue-500/5',
  },
  {
    id: 'ai',
    title: 'AI Analyst',
    desc: 'Master prompt template structure, vector stores, RAG search, and agent cognitive cycles.',
    color: 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5',
  },
  {
    id: 'data',
    title: 'Data Analyst',
    desc: 'Master SQL aggregation queries, pandas transformations, stats analysis, and visual storytelling.',
    color: 'border-amber-500/30 text-amber-600 bg-amber-500/5',
  }
];

export default function Dashboard({ solvedProblemIds, onSelectProblem }: DashboardProps) {
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
  const [companySearch, setCompanySearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'acceptance' | 'difficulty'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Consume gamified state context
  const { theme, userName, level, xp, gold, streak } = useGameState();

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

  // Mock data for Recharts
  const weeklyData = [
    { day: 'Mon', solved: 2 },
    { day: 'Tue', solved: 4 },
    { day: 'Wed', solved: 1 },
    { day: 'Thu', solved: 5 },
    { day: 'Fri', solved: 3 },
    { day: 'Sat', solved: 0 },
    { day: 'Sun', solved: 2 }
  ];

  const difficultyDistribution = [
    { name: 'Easy', value: solvedProblemIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Easy').length || 8, color: '#00C853' },
    { name: 'Medium', value: solvedProblemIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Medium').length || 4, color: '#D97706' },
    { name: 'Hard', value: solvedProblemIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Hard').length || 1, color: '#DC2626' }
  ];

  // Leaderboard mock
  const leaderboard = [
    { rank: 1, name: 'algo_sorcerer', score: 3480, country: '🇺🇸', streak: 42 },
    { rank: 2, name: 'callback_hero', score: 2950, country: '🇬🇧', streak: 18 },
    { rank: 3, name: userName || 'Sravan Kumar', score: 1000 + xp, country: '🇮🇳', streak: streak, isUser: true },
    { rank: 4, name: 'byte_cruncher', score: 940, country: '🇨🇦', streak: 9 },
    { rank: 5, name: 'kernel_guru', score: 810, country: '🇩🇪', streak: 4 }
  ];

  // Achievements mock list
  const achievements = [
    { id: 'first_sub', title: 'First Semicolon', desc: 'Compile your very first solution.', emoji: '🚀', isUnlocked: true },
    { id: 'streak_5', title: 'Streak Legend', desc: 'Maintain a 5-day coding streak.', emoji: '🔥', isUnlocked: streak >= 5 },
    { id: 'easy_rider', title: 'Easy Rider', desc: 'Solve 10 Easy-level problems.', emoji: '🟢', isUnlocked: solvedProblemIds.length >= 5 },
    { id: 'quantum_coder', title: 'Quantum Solver', desc: 'Solve 50 coding problems.', emoji: '⚛️', isUnlocked: false },
    { id: 'master_sql', title: 'Query Master', desc: 'Unlock Distributed DB achievements.', emoji: '💾', isUnlocked: false },
    { id: 'ai_partner', title: 'Partner in Code', desc: 'Consult your Developer Companion Pet.', emoji: '🤖', isUnlocked: true }
  ];

  // Activity Timeline mock
  const timelineEvents = [
    { type: 'solve', title: 'Solved "Two Sum"', desc: 'Optimized search time complexity using Hash Tables.', time: '2 hours ago' },
    { type: 'badge', title: 'Unlocked "Streak Legend" Title', desc: 'Reached Developer Level 5 milestone.', time: '1 day ago' },
    { type: 'gold', title: 'Earned 30 Gold Coins', desc: 'Bonus reward for consecutive coding streak.', time: '3 days ago' },
    { type: 'journey', title: 'Started "ML Engineer" Roadmap', desc: 'Enrolled in basic data preprocessing tracks.', time: '1 week ago' }
  ];

  // Continue learning horizontal mock courses
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
      
      {/* A. Hero Banner with gradient (Clean Minimal) */}
      <div className="relative overflow-hidden rounded-xl border border-border-card bg-gradient-to-r from-bg-card to-hover/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
        <div className="flex flex-col gap-1.5 max-w-lg relative z-10">
          <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider">
            Coding Arena v1.2
          </span>
          <h2 className="text-xl font-bold text-text-main tracking-tight leading-snug">
            Welcome back, {userName || 'Sravan'}.
          </h2>
          <p className="text-xs text-text-muted leading-relaxed font-semibold">
            Consistency is the key to mastering software engineering. Revisit your roadmaps or solve today's challenge to secure your daily points.
          </p>
          <div className="flex gap-2.5 mt-2">
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => onSelectProblem(activeQuest.id)}
              className="flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Continue Coding</span>
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => router.push(`/journey/frontend`)}
            >
              <span>View Roadmaps</span>
            </Button>
          </div>
        </div>

        {/* Side Hero Stats Box (Borderless Slate Style) */}
        <div className="bg-bg-card border border-border-card rounded-xl p-4 flex flex-col gap-3 w-full md:w-56 shadow-xs shrink-0 select-none">
          <div className="flex justify-between items-center text-xs font-semibold text-text-main border-b border-border-card/50 pb-1.5">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" /> Streak</span>
            <span className="text-orange-500 font-bold font-mono">{streak} days</span>
          </div>
          <div className="flex flex-col gap-1 text-[10px] font-semibold text-text-muted">
            <div className="flex justify-between">
              <span>Weekly target</span>
              <span>{solvedProblemIds.length % 5}/5 solved</span>
            </div>
            <div className="w-full h-1 bg-hover rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${((solvedProblemIds.length % 5) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* B. Core Stats Grid Cards (Clean Baseline KPI Layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Challenges Solved', val: solvedProblemIds.length, icon: CheckCircle2, sub: 'Rank tracking', progress: 45 },
          { title: 'Accumulated XP', val: `${xp} XP`, icon: Sparkles, sub: 'Level Up', progress: Math.min(100, Math.floor((xp / getXpForNextLevel(level)) * 100)) },
          { title: 'Platform Gold', val: gold, icon: Coins, sub: 'Shop items', progress: 65 },
          { title: 'Global Rank', val: '#1,248', icon: Trophy, sub: 'Top 5%', progress: 95 }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i}
              className="bg-bg-card border border-border-card rounded-xl p-4.5 flex items-center justify-between gap-3 shadow-xs hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200"
            >
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

      {/* C. Daily Quest & AI Tip side-by-side section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Quest (Flat minimal layout) */}
        <div 
          onClick={() => onSelectProblem && onSelectProblem(activeQuest.id)}
          className="md:col-span-2 group relative border border-border-card bg-bg-card rounded-xl p-5 shadow-xs cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-hover flex items-center justify-center border border-border-card/45">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                Featured Daily Quest
              </span>
            </div>
            <h4 className="text-sm font-bold tracking-tight leading-snug text-text-main group-hover:text-primary transition-colors mt-1.5">
              {activeQuest.title}
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed font-semibold mt-1 max-w-xl">
              Solve today's challenge to maintain your streak and claim standard platform rewards +100 XP and +15 Gold.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-primary mt-4 font-bold font-mono">
            <span>Solve challenge now</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* AI Coding Tip (Flat minimal layout) */}
        <div className="bg-bg-card border border-border-card rounded-xl p-5 flex flex-col gap-3 shadow-xs justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-hover flex items-center justify-center border border-border-card/45 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-wider">AI recommendation</span>
              <h4 className="text-[11px] font-bold text-text-main leading-tight mt-0.5">Two Pointers method</h4>
            </div>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed font-semibold">
            "When analyzing complex array elements, consider starting with the **Two Pointers** approach. It reduces time complexity from $O(N^2)$ to $O(N)$ with no extra memory allocation."
          </p>
          <div className="text-[9px] text-text-muted font-mono font-bold mt-1">
            Tip of the day
          </div>
        </div>
      </div>

      {/* D. Continue Learning Horizon Deck */}
      <div className="flex flex-col gap-2.5 select-none">
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-1.5">
          Continue Learning
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-card custom-scrollbar">
          {learningCourses.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div 
                key={idx}
                className="w-60 shrink-0 bg-bg-card border border-border-card rounded-xl p-4 flex flex-col gap-3 shadow-xs hover:border-primary/20 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg bg-hover flex items-center justify-center border border-border-card/40">
                    <Icon className="w-4 h-4 text-text-muted" />
                  </div>
                  <Badge variant={c.difficulty === 'Easy' ? 'easy' : c.difficulty === 'Medium' ? 'medium' : 'hard'}>
                    {c.difficulty}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main leading-snug line-clamp-1">
                    {c.title}
                  </h4>
                  <p className="text-[9px] text-text-muted font-bold font-mono mt-0.5">{c.time}</p>
                </div>
                <div className="flex flex-col gap-1 border-t border-border-card/45 pt-2.5">
                  <div className="flex justify-between text-[9px] text-text-muted font-bold leading-none">
                    <span>Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-hover rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* E. Recommended Problems Cards & Upcoming Contests Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recommended Challenges */}
        <div className="md:col-span-2 flex flex-col gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-1.5">
            Recommended Challenges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedProblems.slice(0, 2).map((p) => (
              <div 
                key={p.id}
                className="bg-bg-card border border-border-card rounded-xl p-4.5 flex flex-col gap-3 shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex flex-col gap-1 leading-snug">
                  <div className="flex items-center justify-between">
                    <Badge variant={p.difficulty === 'Easy' ? 'easy' : p.difficulty === 'Medium' ? 'medium' : 'hard'}>
                      {p.difficulty}
                    </Badge>
                    <span className="text-[10px] text-text-muted font-bold font-mono">{p.acceptance} acc</span>
                  </div>
                  <h4 className="text-xs font-bold text-text-main mt-2 group-hover:text-primary transition-colors line-clamp-1">
                    {p.title}
                  </h4>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[22px] items-center">
                  {p.topics.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] font-mono bg-hover border border-border-card/45 px-1.5 py-0.5 rounded text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-border-card/45 pt-2.5 mt-1">
                  <span className="text-[9px] font-mono font-bold text-text-muted flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" /> +{p.difficulty === 'Easy' ? 100 : p.difficulty === 'Medium' ? 200 : 400} XP
                  </span>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelectProblem(p.id)}
                    className="h-7 px-2.5"
                  >
                    Solve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Contests */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-1.5">
            Upcoming Contests
          </h3>
          <div className="bg-bg-card rounded-xl border border-border-card p-4 flex flex-col gap-3 shadow-xs h-full justify-between">
            <div className="flex flex-col gap-2.5">
              {upcomingContests.map((c, i) => (
                <div key={i} className="flex gap-2 text-xs border-b border-border-card/40 last:border-none pb-2.5 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-hover border border-border-card/45 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-text-main hover:text-primary transition-colors cursor-pointer leading-snug truncate block">
                      {c.name}
                    </span>
                    <div className="flex justify-between items-center text-[9px] text-text-muted mt-0.5 font-bold font-mono">
                      <span>{c.time}</span>
                      <span className="text-primary">{c.reward}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => router.push('/test-arena')}
              className="w-full text-center text-[10px] font-mono font-bold text-primary hover:underline flex items-center justify-center gap-0.5 mt-1 cursor-pointer"
            >
              <span>Contest Hub</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* F. Filter Section (Categorization tab, search toolbar, problems list) */}
      <div className="flex flex-col gap-4 border-t border-border-card/65 pt-5">
        <div className="flex flex-col gap-1 leading-snug">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main">
            Practice Core Library
          </h3>
          <p className="text-[11px] text-text-muted leading-relaxed font-semibold">
            Filter through our comprehensive catalog of database engines, algorithm structures, and ml evaluations.
          </p>
        </div>

        {/* Topic Tags Filtering Block */}
        <div className="flex flex-col gap-2 bg-bg-card p-4 rounded-xl border border-border-card shadow-xs">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-0.5 font-bold">Filter by Topic</p>
          <div className="flex flex-wrap gap-1.5 max-h-[88px] overflow-y-auto pr-1 custom-scrollbar">
            {TOPIC_TAGS.map((tag) => {
              const isActive = selectedTopic === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() => {
                    setSelectedTopic(isActive ? null : tag.name);
                    setCurrentPage(1);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 font-bold' 
                      : 'bg-bg-base text-text-muted hover:text-text-main border border-transparent hover:border-border-card/50'
                  }`}
                >
                  <span>{tag.name}</span>
                  <span className={`text-[9px] font-mono ${isActive ? 'text-primary' : 'text-text-muted/50'}`}>{tag.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categorization Toolbar tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card p-4 rounded-xl border border-border-card shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {['All Topics', 'Algorithms', 'Data Structures', 'Database'].map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`text-[11px] font-mono font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg border cursor-pointer transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-bg-base text-text-muted border-border-card/70 hover:text-text-main hover:border-border-card'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 select-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-main placeholder-text-muted/65 transition-colors font-semibold"
            />
          </div>
        </div>

        {/* Search & Sub-Filters Toolbar (Difficulty buttons & Stats) */}
        <div className="flex flex-col gap-2.5 bg-bg-card p-4 rounded-xl border border-border-card shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider font-bold">Difficulty:</span>
            {([null, 'Easy', 'Medium', 'Hard'] as (string | null)[]).map((diff) => {
              const isActive = selectedDifficulty === diff;
              return (
                <button
                  key={diff || 'All'}
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    setCurrentPage(1);
                  }}
                  className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-bg-base text-text-muted border-border-card/50 hover:text-text-main hover:bg-hover'
                  }`}
                >
                  {diff || 'All'}
                </button>
              );
            })}

            {selectedCompany && (
              <div className="flex items-center gap-1 bg-primary/5 text-primary border border-primary/20 text-[9px] font-bold font-mono py-0.5 px-2 rounded-md">
                <span>Prep: {selectedCompany}</span>
                <button 
                  onClick={() => setSelectedCompany(null)} 
                  className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold font-mono text-text-muted/70 border-t border-border-card/35 pt-1.5">
            <span>Filter matches: {filteredProblems.length}</span>
            <span>Showing {paginatedProblems.length} records per page</span>
          </div>
        </div>

        {/* Grid Problems Table List */}
        <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-border-card bg-bg-base/30 text-text-muted text-[10px] font-mono font-bold uppercase tracking-wider select-none">
                  <th className="py-3.5 px-4 w-14 text-center">Status</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-text-main transition-colors" onClick={() => handleSort('title')}>
                    Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-text-main transition-colors" onClick={() => handleSort('difficulty')}>
                    Difficulty {sortBy === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-text-main transition-colors" onClick={() => handleSort('acceptance')}>
                    Acceptance {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-4 w-28 text-center">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/30">
                {paginatedProblems.map((prob) => {
                  const isSolved = solvedProblemIds.includes(prob.id);
                  return (
                    <tr 
                      key={prob.id}
                      onClick={() => onSelectProblem(prob.id)}
                      className="hover:bg-hover/20 border-b border-border-card/20 last:border-0 transition-all duration-100 group cursor-pointer"
                    >
                      {/* Status Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {isSolved ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-border-card/85 group-hover:border-primary/50 transition-colors" />
                          )}
                        </div>
                      </td>

                      {/* Title & tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12.5px] font-bold text-text-main group-hover:text-primary transition-colors">
                            {prob.id}. {prob.title}
                          </span>
                          <div className="flex gap-1.5 flex-wrap items-center mt-0.5">
                            {prob.topics.slice(0, 3).map((topic) => (
                              <span 
                                key={topic}
                                className="text-[9px] font-mono text-text-muted bg-hover/50 px-1 py-0.5 rounded"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4">
                        <Badge variant={prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Medium' ? 'medium' : 'hard'}>
                          {prob.difficulty}
                        </Badge>
                      </td>

                      {/* Acceptance rate */}
                      <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-text-muted">
                        {prob.acceptance}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[9.5px] font-mono font-bold text-text-muted bg-hover/40 px-2 py-0.5 rounded border border-border-card/45">
                          {prob.category}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredProblems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 px-4 text-center text-xs text-text-muted font-mono">
                      No challenges match your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border-card bg-bg-base/30">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <div className="flex items-center gap-1.5">
                {pageNumbers.map((num, idx) => {
                  if (num < 0) {
                    return (
                      <span key={`ell-${idx}`} className="text-text-muted px-1.5 font-bold">
                        ...
                      </span>
                    );
                  }
                  const isActive = currentPage === num;
                  return (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-7 h-7 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-primary text-white font-extrabold shadow-sm' 
                          : 'text-text-muted hover:text-text-main bg-bg-base hover:bg-hover border border-border-card/40'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* G. Interactive Recharts Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-card/65 pt-5">
        
        {/* Weekly activity (Bar chart) */}
        <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-text-muted" /> Weekly Practice Output
            </h4>
            <p className="text-[9px] text-text-muted font-bold font-mono mt-0.5">Solved challenges count</p>
          </div>
          <div className="w-full h-48 mt-2">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0, 200, 83, 0.02)' }} contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-card)', borderRadius: '8px', color: 'var(--color-text-main)', fontSize: '10px', fontFamily: 'monospace' }} />
                  <Bar dataKey="solved" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-hover/20 animate-pulse rounded-lg" />
            )}
          </div>
        </div>

        {/* Solved by difficulty (Pie chart) */}
        <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5">
              <Award className="w-4 h-4 text-text-muted" /> Distribution by Difficulty
            </h4>
            <p className="text-[9px] text-text-muted font-bold font-mono mt-0.5">Easy, Medium, Hard breakdown</p>
          </div>
          <div className="w-full h-48 mt-2 flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-card)', borderRadius: '8px', color: 'var(--color-text-main)', fontSize: '10px', fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-hover/20 animate-pulse rounded-lg" />
            )}
            {/* Legend overlay */}
            <div className="flex flex-col gap-2 shrink-0 pr-2 text-[10px] font-mono font-bold">
              {difficultyDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-text-main">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* H. Bottom Section Layout: Achievements, Timeline, Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-card/65 pt-5 pb-8">
        
        {/* Achievements Grid Cabinet */}
        <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
              <Trophy className="w-4 h-4 text-text-muted" /> Badge Cabinet
            </h4>
            <p className="text-[9px] text-text-muted font-bold font-mono mt-0.5">Trophies unlocked on your journey</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1 select-none">
            {achievements.map((ach) => (
              <div 
                key={ach.id}
                className={`p-3 rounded-lg border flex flex-col items-center text-center gap-2 transition-all duration-200 relative group overflow-hidden ${
                  ach.isUnlocked 
                    ? 'bg-bg-card border-border-card hover:border-primary/20' 
                    : 'bg-bg-card border-border-card/35 opacity-45'
                }`}
                title={ach.desc}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-xs border ${
                  ach.isUnlocked ? 'bg-hover border-border-card' : 'bg-bg-base border-transparent'
                }`}>
                  {ach.isUnlocked ? ach.emoji : <Lock className="w-3.5 h-3.5 text-text-muted/65" />}
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-text-main leading-tight truncate w-24">
                    {ach.title}
                  </h5>
                  <p className="text-[8.5px] text-text-muted mt-0.5 leading-snug line-clamp-2">
                    {ach.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline Widget */}
        <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-muted" /> Activity Log
            </h4>
            <p className="text-[9px] text-text-muted font-bold font-mono mt-0.5">Chronology of solved scripts</p>
          </div>
          
          <div className="flex flex-col gap-3 font-sans text-xs relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border-card/65 mt-1">
            {timelineEvents.map((ev, idx) => (
              <div key={idx} className="flex gap-4 items-start relative z-10">
                <div className="w-5 h-5 rounded-full bg-hover border border-border-card/75 text-text-main flex items-center justify-center flex-shrink-0 text-[10px] shadow-xs">
                  {ev.type === 'solve' ? '✓' : ev.type === 'badge' ? '⭐' : ev.type === 'gold' ? '🪙' : '📚'}
                </div>
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="flex justify-between items-baseline gap-2">
                    <h5 className="font-bold text-text-main text-[11px] truncate">
                      {ev.title}
                    </h5>
                    <span className="text-[8.5px] font-mono text-text-muted/65 font-bold whitespace-nowrap shrink-0">
                      {ev.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed font-semibold mt-0.5">
                    {ev.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Standing (Highlighting User) */}
        <div className="md:col-span-2 bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border-card/50 pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-text-muted" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main">
                Leaderboard Standing
              </h4>
            </div>
            <span className="text-[9px] font-mono text-text-muted font-bold">Global Ranking Preview</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-border-card text-text-muted font-mono font-bold text-[9px] uppercase select-none">
                  <th className="py-2 px-3 w-14 text-center">Rank</th>
                  <th className="py-2 px-3">Coder</th>
                  <th className="py-2 px-3 text-center">Country</th>
                  <th className="py-2 px-3 text-center font-mono">Streak</th>
                  <th className="py-2 px-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/20">
                {leaderboard.map((user) => (
                  <tr 
                    key={user.rank}
                    className={`hover:bg-hover/10 transition-colors ${
                      user.isUser ? 'bg-primary/5 text-primary font-bold border-l-2 border-primary' : 'text-text-main'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{user.rank}</td>
                    <td className="py-2.5 px-3 flex items-center gap-1.5">
                      {user.isUser && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                      <span className="truncate">{user.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-base">{user.country}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{user.streak} days</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{user.score} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
