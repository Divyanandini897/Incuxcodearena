'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  CheckCircle, 
  Calendar, 
  Award, 
  SlidersHorizontal, 
  Compass, 
  Clock,
  Sparkles,
  Sword,
  Shield,
  Zap,
  Star,
  Coins
} from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { PROBLEMS_DATA, TOPIC_TAGS, COMPANIES_LIST } from '../data/data';
import { useGameState, getXpForNextLevel } from '../lib/gameState';
import Link from 'next/link';

// Import playful components
import ThemeSelector from './dashboard/ThemeSelector';

interface DashboardProps {
  solvedProblemIds: number[];
  onSelectProblem: (id: number) => void;
}

const AVATARS: Record<string, { emoji: string; gradient: string }> = {
  sherlock: { emoji: '🕵️‍♂️', gradient: 'from-amber-600 to-orange-700' },
  neo: { emoji: '🕶️', gradient: 'from-slate-700 to-slate-900' },
  yoda: { emoji: '🧙‍♂️', gradient: 'from-emerald-600 to-teal-700' },
  stark: { emoji: '🦾', gradient: 'from-red-600 to-yellow-600' },
};

export default function Dashboard({ solvedProblemIds, onSelectProblem }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companySearch, setCompanySearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'acceptance' | 'difficulty'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Consume our gamified context
  const { level, xp, avatar, title, gold, streak, theme, userName } = useGameState();
  const avatarInfo = AVATARS[avatar] || AVATARS.badger;

  // Dynamic Daily Challenge (First unsolved problem)
  const activeQuest = useMemo(() => {
    return PROBLEMS_DATA.find(p => !solvedProblemIds.includes(p.id)) || PROBLEMS_DATA[0];
  }, [solvedProblemIds]);

  // Current day of July 2026
  const currentDay = 7;
  const daysInJuly = 31;
  const startDayOffset = 3;

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInJuly; i++) {
      days.push(i);
    }
    return days;
  }, []);

  // Filter & Sort logic
  const filteredProblems = useMemo(() => {
    return PROBLEMS_DATA.filter((prob) => {
      const matchesSearch = prob.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            prob.id.toString() === searchTerm;
      const matchesTopic = !selectedTopic || prob.topics.includes(selectedTopic);
      const matchesCategory = selectedCategory === 'All Topics' || prob.category === selectedCategory;
      const matchesCompany = !selectedCompany || prob.companies.some(c => c.name === selectedCompany);

      return matchesSearch && matchesTopic && matchesCategory && matchesCompany;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.id - b.id;
      } else if (sortBy === 'acceptance') {
        const rateA = parseFloat(a.acceptance);
        const rateB = parseFloat(b.acceptance);
        comparison = rateA - rateB;
      } else if (sortBy === 'difficulty') {
        const diffWeight = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        comparison = diffWeight[a.difficulty] - diffWeight[b.difficulty];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchTerm, selectedTopic, selectedCategory, selectedCompany, sortBy, sortOrder]);

  const solvedBreakdown = useMemo(() => {
    let easy = 0, medium = 0, hard = 0;
    PROBLEMS_DATA.forEach(p => {
      if (solvedProblemIds.includes(p.id)) {
        if (p.difficulty === 'Easy') easy++;
        else if (p.difficulty === 'Medium') medium++;
        else if (p.difficulty === 'Hard') hard++;
      }
    });
    return { easy, medium, hard };
  }, [solvedProblemIds]);

  const solvedCount = solvedProblemIds.length;

  const filteredCompanies = useMemo(() => {
    return COMPANIES_LIST.filter(c => 
      c.name.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companySearch]);

  const handleSort = (field: 'id' | 'acceptance' | 'difficulty') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const xpNeeded = getXpForNextLevel(level);
  const xpPercentage = Math.min(100, Math.floor((xp / xpNeeded) * 100));

  // Mapping of difficulty levels
  const getDifficultyType = (difficulty: Difficulty) => {
    if (difficulty === 'Easy') return { name: '🟢 Easy', color: 'text-emerald-500' };
    if (difficulty === 'Medium') return { name: '🟡 Medium', color: 'text-amber-500' };
    return { name: '🔴 Hard', color: 'text-red-500' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-64px)] font-sans px-2">
      
      {/* 1. Left Panel (3/12 Width) - Hero Character Summary Card */}
      <aside className="lg:col-span-3 flex flex-col gap-8 text-sm" id="sidebar_nav">
        
        {/* Playful Hero Card */}
        <div className="bg-bg-card border border-border-card rounded-xl p-6 flex flex-col gap-5 glow-border relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary/10 text-primary border-l border-b border-primary/20 px-3 py-1 rounded-bl-lg font-mono text-[10px] font-bold">
            MY STATS
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${avatarInfo.gradient} p-[2.5px] flex items-center justify-center text-4xl shadow-lg shadow-black/40`}>
              <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center">
                {avatarInfo.emoji}
              </div>
            </div>
            <div className="flex flex-col leading-tight gap-1">
              <h2 className="font-extrabold text-base text-text-main tracking-tight flex items-center gap-1.5">
                <span>{userName}</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              </h2>
              <span className="text-[10px] text-accent-secondary font-bold uppercase tracking-wider leading-none">{title}</span>
              <span className="text-xs font-mono text-text-muted">Lv. {level} Coder</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="flex flex-col gap-2 font-mono text-xs mt-1">
            <div className="flex justify-between font-bold text-text-main">
              <span>Level Progress</span>
              <span className="text-text-muted">{xp}/{xpNeeded} XP</span>
            </div>
            <div className="w-full h-4 bg-bg-base rounded-full overflow-hidden border border-border-card p-[1px]">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent-secondary rounded-full transition-all duration-500 shadow-[0_0_8px_var(--primary)]"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Core stats breakdown */}
          <div className="border-t border-border-card/50 pt-4 flex flex-col gap-3">
            <p className="text-xs font-mono text-text-muted uppercase tracking-wider font-extrabold">Attributes</p>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 bg-bg-base/60 p-2 rounded border border-border-card/45">
                <Sword className="w-4.5 h-4.5 text-red-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted leading-none">Code Power</span>
                  <span className="font-bold text-text-main text-sm mt-0.5">{level * 10}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-bg-base/60 p-2 rounded border border-border-card/45">
                <Shield className="w-4.5 h-4.5 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted leading-none">Gold Earned</span>
                  <span className="font-bold text-text-main text-sm mt-0.5">{gold} G</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-bg-base/60 p-2 rounded border border-border-card/45 col-span-2">
                <Zap className="w-4.5 h-4.5 text-amber-400" />
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-text-muted font-bold">Multiplier</span>
                  <span className="font-extrabold text-text-main text-sm">{streak}x Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Solved Counts */}
          <div className="border-t border-border-card/50 pt-4 flex flex-col gap-2.5 text-sm font-mono">
            <p className="text-xs font-mono text-text-muted uppercase tracking-wider font-extrabold">Problems Solved</p>
            <div className="flex justify-between items-center text-text-main font-bold">
              <span className="text-emerald-500">🟢 Easy</span>
              <span className="font-extrabold text-sm">{solvedBreakdown.easy}</span>
            </div>
            <div className="flex justify-between items-center text-text-main font-bold">
              <span className="text-amber-500">🟡 Medium</span>
              <span className="font-extrabold text-sm">{solvedBreakdown.medium}</span>
            </div>
            <div className="flex justify-between items-center text-text-main font-bold">
              <span className="text-red-500">🔴 Hard</span>
              <span className="font-extrabold text-sm">{solvedBreakdown.hard}</span>
            </div>
          </div>
        </div>

        {/* Navigation Utilities */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider px-3 mb-1 font-bold">Navigation</p>
          <button 
            onClick={() => { setSelectedTopic(null); setSelectedCompany(null); setSelectedCategory('All Topics'); }}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-lg transition-colors cursor-pointer text-sm font-bold ${!selectedTopic && !selectedCompany && selectedCategory === 'All Topics' ? 'bg-primary/10 border border-primary/20 text-text-main font-extrabold' : 'text-text-muted hover:text-text-main hover:bg-bg-card/45'}`}
          >
            <Compass className="w-5 h-5 text-primary" />
            <span>Problems Library</span>
          </button>
          <Link 
            href="/profile"
            className="flex items-center gap-3.5 px-4 py-3 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-card/45 transition-colors text-sm font-bold"
          >
            <Award className="w-5 h-5 text-accent-secondary" />
            <span>My Profile</span>
          </Link>
        </div>

        {/* Custom Prep Boards */}
        <div className="flex flex-col gap-2 border-t border-border-card/50 pt-5">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider px-3 mb-1 font-bold">Study Tracks</p>
          <button 
            onClick={() => { setSelectedCompany('Deloitte'); setSelectedTopic(null); }}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all cursor-pointer text-sm font-bold ${selectedCompany === 'Deloitte' ? 'bg-accent-secondary/15 text-accent-secondary font-extrabold border border-accent-secondary/30' : 'text-text-muted hover:text-text-main'}`}
          >
            <span className="truncate">Deloitte Course</span>
            <span className="text-xs font-mono bg-bg-card px-2 py-0.5 rounded border border-border-card text-text-muted">32</span>
          </button>
          <button 
            onClick={() => { setSelectedCompany('Google'); setSelectedTopic(null); }}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all cursor-pointer text-sm font-bold ${selectedCompany === 'Google' ? 'bg-primary/10 text-primary font-extrabold border border-primary/20' : 'text-text-muted hover:text-text-main'}`}
          >
            <span className="truncate">Google Track</span>
            <span className="text-xs font-mono bg-bg-card px-2 py-0.5 rounded border border-border-card text-text-muted">2318</span>
          </button>
        </div>
      </aside>

      {/* 2. Center Feed (6/12 Width) - Arena Feed & Problems List */}
      <main className="lg:col-span-6 flex flex-col gap-8" id="core_feed">
        
        {/* Compact Daily Challenge Banner */}
        {activeQuest && (
          <div 
            onClick={() => onSelectProblem(activeQuest.id)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all duration-300 hover:scale-[1.005] cursor-pointer group glow-border"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-black bg-primary text-white px-2 py-1 rounded select-none uppercase tracking-wider">
                Daily Challenge
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-black text-text-main group-hover:text-primary transition-colors">
                  {activeQuest.title}
                </span>
                <span className="text-[11px] text-text-muted mt-0.5 font-semibold">
                  Difficulty: {getDifficultyType(activeQuest.difficulty).name}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono font-extrabold text-text-muted">
              <span className="flex items-center gap-1.5 text-accent-secondary">
                <Sparkles className="w-4 h-4 text-accent-secondary animate-pulse" /> +{activeQuest.difficulty === 'Easy' ? 100 : activeQuest.difficulty === 'Medium' ? 200 : 400} XP
              </span>
              <span className="flex items-center gap-1.5 text-yellow-600">
                <Coins className="w-4 h-4 text-yellow-600" /> +{activeQuest.difficulty === 'Easy' ? 15 : activeQuest.difficulty === 'Medium' ? 30 : 60}g
              </span>
            </div>
          </div>
        )}

        {/* Topic Filters Selector */}
        <div className="flex flex-col gap-3 bg-bg-card p-5 rounded-xl border border-border-card glow-border">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider font-extrabold">Filter by Topic</p>
          <div className="flex flex-wrap gap-2 max-h-[105px] overflow-y-auto pr-1">
            {TOPIC_TAGS.map((tag) => (
              <button
                key={tag.name}
                onClick={() => {
                  setSelectedTopic(selectedTopic === tag.name ? null : tag.name);
                  setSelectedCompany(null);
                }}
                className={`text-xs px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer font-bold ${
                  selectedTopic === tag.name 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-bg-base/60 text-text-muted hover:text-text-main border border-transparent hover:border-border-card'
                }`}
              >
                <span>{tag.name}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  selectedTopic === tag.name ? 'bg-primary/20 text-primary' : 'bg-bg-card text-text-muted/60'
                }`}>{tag.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categorization Toolbar tabs */}
        <div className="flex items-center justify-between border-b border-border-card pb-1">
          <div className="flex items-center gap-3 overflow-x-auto pr-2 scrollbar-none">
            {['All Topics', 'Algorithms', 'Database', 'Shell', 'Concurrency'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative text-sm px-4 py-3 transition-colors whitespace-nowrap cursor-pointer font-extrabold ${
                  selectedCategory === cat ? 'text-text-main font-black' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {cat}
                {selectedCategory === cat && (
                  <motion.div 
                    layoutId="activeCategoryBorder" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sort Panel */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-bg-card/50 p-2.5 rounded-xl border border-border-card">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search question by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-base border border-border-card focus:border-primary/50 focus:outline-none rounded-lg pl-11 pr-4 py-2.5 text-sm text-text-main placeholder-text-muted/50 transition-colors font-semibold"
            />
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 font-mono text-xs text-text-muted">
            <button 
              onClick={() => handleSort('acceptance')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer font-bold ${
                sortBy === 'acceptance' ? 'bg-bg-base border-border-card text-text-main' : 'border-transparent hover:bg-bg-card/40'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>Sort by Acceptance</span>
              {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            <div className="h-5 w-px bg-border-card" />

            <div className="flex items-center gap-2 bg-bg-base px-4 py-2.5 rounded-lg border border-border-card text-primary font-bold text-sm">
              <Clock className="w-4.5 h-4.5 animate-pulse" />
              <span>{solvedCount}/{PROBLEMS_DATA.length} Solved</span>
            </div>
          </div>
        </div>

        {/* Questions Grid Table */}
        <div className="overflow-hidden rounded-xl border border-border-card bg-bg-card glow-border" id="problems_grid">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-card bg-bg-base/70 text-text-muted font-mono select-none">
                  <th className="py-4 pl-4 w-14 text-center">Status</th>
                  <th className="py-4 px-4 w-20 cursor-pointer hover:text-text-main" onClick={() => handleSort('id')}>
                    Index {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4 px-4">Problem Name</th>
                  <th className="py-4 px-4 w-32 cursor-pointer hover:text-text-main" onClick={() => handleSort('acceptance')}>
                    Acceptance {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4 px-4 w-36 cursor-pointer hover:text-text-main" onClick={() => handleSort('difficulty')}>
                    Difficulty {sortBy === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4 pr-4 w-20 text-center">Gold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/50">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-text-muted font-mono text-sm">
                      No problems found.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((prob) => {
                    const isSolved = solvedProblemIds.includes(prob.id) || prob.solved;
                    const diffTag = getDifficultyType(prob.difficulty);
                    
                    return (
                      <tr 
                        key={prob.id}
                        onClick={() => onSelectProblem(prob.id)}
                        className="hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer group hover-wiggle"
                      >
                        {/* Status Checkbox */}
                        <td className="py-5 pl-4 text-center">
                          {isSolved ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                              <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/15" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-border-card mx-auto group-hover:border-primary/50 transition-colors" />
                          )}
                        </td>
                        
                        {/* ID Column */}
                        <td className="py-5 px-4 font-mono text-text-muted text-sm">{prob.id}</td>
                        
                        {/* Title Column */}
                        <td className="py-5 px-4 font-extrabold text-text-main text-base group-hover:text-primary transition-colors">
                          {prob.title}
                          <div className="flex gap-2 mt-1.5 select-none font-semibold">
                            {prob.topics.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] font-mono text-text-muted bg-bg-base px-2 py-0.5 rounded border border-border-card/50">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        
                        {/* Acceptance Rate Column */}
                        <td className="py-5 px-4 font-mono text-text-muted text-sm">{prob.acceptance}</td>
                        
                        {/* Difficulty Column */}
                        <td className="py-5 px-4">
                          <div className="flex flex-col leading-tight">
                            <span className={`text-xs font-black ${diffTag.color}`}>
                              {diffTag.name}
                            </span>
                          </div>
                        </td>
                        
                        {/* Action reward gold */}
                        <td className="py-5 pr-4 text-center text-xs font-mono font-extrabold text-yellow-600" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 bg-bg-base/50 py-1.5 px-2.5 rounded border border-border-card/50">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{prob.difficulty === 'Easy' ? 15 : prob.difficulty === 'Medium' ? 30 : 60}g</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 3. Right Panel (3/12 Width) - Theme Selector & Extras */}
      <aside className="lg:col-span-3 flex flex-col gap-8" id="widgets_panel">
        
        {/* Aesthetic Theme Switcher */}
        <ThemeSelector />

        {/* Calendar Module */}
        <div className="bg-bg-card rounded-xl border border-border-card p-5 flex flex-col gap-4 glow-border">
          <div className="flex items-center justify-between text-xs font-semibold border-b border-border-card pb-3">
            <div className="flex items-center gap-2 text-text-main text-sm font-bold">
              <Calendar className="w-4.5 h-4.5 text-primary" />
              <span>Daily Activity</span>
            </div>
            <span className="text-[10px] font-mono text-text-muted font-bold">Grid</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono font-bold text-text-muted/65">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-xs">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={idx} />;
              
              const isToday = day === currentDay;
              const isPast = day < currentDay;

              return (
                <div 
                  key={idx}
                  className={`relative aspect-square flex items-center justify-center rounded-full text-xs font-black ${
                    isToday 
                      ? 'bg-primary text-white font-bold ring-4 ring-primary/20 shadow-lg shadow-primary/20' 
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
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Companies */}
        <div className="bg-bg-card rounded-xl border border-border-card p-5 flex flex-col gap-4 glow-border">
          <p className="text-sm font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-3">Target Companies</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search companies..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full bg-bg-base border border-border-card focus:border-primary/40 focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-text-main placeholder-text-muted/50 transition-colors font-semibold"
            />
          </div>

          <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1">
            {filteredCompanies.map((comp) => (
              <button
                key={comp.name}
                onClick={() => {
                  setSelectedCompany(selectedCompany === comp.name ? null : comp.name);
                  setSelectedTopic(null);
                }}
                className={`text-xs px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                  selectedCompany === comp.name 
                    ? 'bg-primary/20 text-primary border border-primary/30 font-extrabold' 
                    : 'bg-bg-base text-text-muted hover:text-text-main border border-transparent hover:border-border-card'
                }`}
              >
                <span>{comp.name}</span>
                <span className={`text-[10px] font-mono font-bold ${
                  selectedCompany === comp.name ? 'text-primary' : 'text-text-muted/50'
                }`}>{comp.frequency}</span>
              </button>
            ))}
            {filteredCompanies.length === 0 && (
              <p className="text-xs text-text-muted font-mono text-center w-full py-2">No matches</p>
            )}
          </div>
        </div>
      </aside>

    </div>
  );
}
