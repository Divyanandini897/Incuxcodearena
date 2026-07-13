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
  Lock,
  Unlock,
  Calendar,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  SlidersHorizontal,
  Bell,
  Globe,
  Layers,
  Compass,
  Bookmark,
  FolderLock,
  ChevronDown,
  Clock,
  Mail,
  User,
} from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { PROBLEMS_DATA, TOPIC_TAGS, COMPANIES_LIST } from '../data';

interface UserProfile {
  name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  provider?: string | null;
}

interface DashboardProps {
  userProfile?: UserProfile | null;
  solvedProblemIds: number[];
  onSelectProblem: (id: number) => void;
}

export default function Dashboard({ userProfile, solvedProblemIds, onSelectProblem }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companySearch, setCompanySearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'acceptance' | 'difficulty'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favoriteLocked, setFavoriteLocked] = useState(true);

  // Banners for custom learning tracks
  const banners = [
    {
      title: 'Interview Crash Course',
      desc: 'Master key patterns in 15 days.',
      track: 'Data Structures & Algorithms',
      color: 'from-emerald-950/40 to-slate-900/40 border-emerald-800/30',
      tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'System Design Blueprint',
      desc: 'Architect highly scalable services.',
      track: 'Advanced Architecture',
      color: 'from-amber-950/40 to-slate-900/40 border-amber-800/30',
      tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      title: 'Top SQL 50 Study Plan',
      desc: 'Crack relational query challenges.',
      track: 'Database Mastery',
      color: 'from-cyan-950/40 to-slate-900/40 border-cyan-800/30',
      tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    }
  ];

  // Current day of July 2026
  const currentDay = 7; // July 7, 2026
  const daysInJuly = 31;
  const startDayOffset = 3; // July 1st, 2026 is Wednesday (offset by 3 days)

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    // Pad initial days
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
      // 1. Text search
      const matchesSearch = prob.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            prob.id.toString() === searchTerm;
      
      // 2. Topic tag
      const matchesTopic = !selectedTopic || prob.topics.includes(selectedTopic);

      // 3. Category toolbar
      const matchesCategory = selectedCategory === 'All Topics' || prob.category === selectedCategory;

      // 4. Company tag
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

  const solvedCount = useMemo(() => {
    return PROBLEMS_DATA.filter(p => solvedProblemIds.includes(p.id)).length;
  }, [solvedProblemIds]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-56px)] font-sans">
      
      {/* 1. User Profile Card (Top Banner) */}
      {userProfile && (
        <div className="lg:col-span-12 bg-gradient-to-r from-emerald-950/30 to-slate-900/30 border border-emerald-800/20 rounded-xl p-4 flex items-center gap-4">
          {userProfile.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile.name || 'User'}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-sm font-bold text-white">
              {(userProfile.name || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-[#f5f5f5] truncate flex items-center gap-2">
              {userProfile.name || 'User'}
              {userProfile.username && (
                <span className="text-[11px] text-[#a0a0a0] font-mono font-normal">
                  @{userProfile.username}
                </span>
              )}
            </h2>
            <p className="text-xs text-[#a0a0a0] truncate">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 shrink-0" />
                {userProfile.email}
              </span>
            </p>
            {userProfile.provider && userProfile.provider !== 'email' && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/80 font-mono mt-1">
                <Globe className="w-3 h-3" />
                Signed in with {userProfile.provider.charAt(0).toUpperCase() + userProfile.provider.slice(1)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. Sidebar Navigation (Left Panel - 20% Width) */}
      <aside className="lg:col-span-2 flex flex-col gap-6 text-sm border-r border-[#1e1e1e] pr-4" id="sidebar_nav">
        {/* Section A: Main Utilities */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider px-3 mb-2">Navigation</p>
          <button 
            onClick={() => { setSelectedTopic(null); setSelectedCompany(null); setSelectedCategory('All Topics'); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${!selectedTopic && !selectedCompany && selectedCategory === 'All Topics' ? 'bg-[#1e1e1e] text-[#f5f5f5] font-medium' : 'text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#1e1e1e]/40'}`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Library</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#1e1e1e]/40">
            <Compass className="w-4 h-4" />
            <span>Quest</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#1e1e1e]/40">
            <Layers className="w-4 h-4" />
            <span>Explore</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#1e1e1e]/40">
            <Award className="w-4 h-4" />
            <span>Study Plan</span>
          </button>
        </div>

        {/* Section B: My Lists */}
        <div className="flex flex-col gap-1 border-t border-[#1e1e1e] pt-4">
          <p className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider px-3 mb-2">My Lists</p>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1e1e1e]/20 text-[#f5f5f5]">
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>Favorites</span>
            </div>
            <button 
              onClick={() => setFavoriteLocked(!favoriteLocked)} 
              title={favoriteLocked ? "Lock folder" : "Unlock folder"}
              className="text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors"
            >
              {favoriteLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Section C: Saved By Me / Custom Filters */}
        <div className="flex flex-col gap-1 border-t border-[#1e1e1e] pt-4">
          <p className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider px-3 mb-2">Custom Filters</p>
          <button 
            onClick={() => { setSelectedCompany('Deloitte'); setSelectedTopic(null); }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${selectedCompany === 'Deloitte' ? 'bg-emerald-950/30 text-emerald-400 font-medium border border-emerald-800/30' : 'text-[#a0a0a0] hover:text-[#f5f5f5]'}`}
          >
            <span className="truncate">Deloitte Prep</span>
            <span className="text-[10px] font-mono bg-[#1e1e1e] px-1.5 py-0.5 rounded text-[#a0a0a0]">32</span>
          </button>
          <button 
            onClick={() => { setSelectedCompany('Google'); setSelectedTopic(null); }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${selectedCompany === 'Google' ? 'bg-[#1e1e1e] text-[#f5f5f5] font-medium' : 'text-[#a0a0a0] hover:text-[#f5f5f5]'}`}
          >
            <span className="truncate">Google Track</span>
            <span className="text-[10px] font-mono bg-[#1e1e1e] px-1.5 py-0.5 rounded text-[#a0a0a0]">2318</span>
          </button>
        </div>
      </aside>

      {/* 3. Core Feed (Center Panel - 60% Width) */}
      <main className="lg:col-span-8 flex flex-col gap-6" id="core_feed">
        {/* Feature Carousel Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((ban, idx) => (
            <div 
              key={idx}
              className={`flex flex-col justify-between p-4 rounded-xl border bg-gradient-to-br ${ban.color} transition-all duration-300 hover:scale-[1.01] hover:border-[#3e3e3e]`}
            >
              <div>
                <span className={`inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${ban.tagColor} mb-2`}>
                  {ban.track}
                </span>
                <h3 className="text-sm font-semibold text-[#f5f5f5] tracking-tight">{ban.title}</h3>
                <p className="text-xs text-[#a0a0a0] mt-1 line-clamp-2">{ban.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#f5f5f5] font-medium mt-4 group cursor-pointer">
                <span>Start Learning</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#a0a0a0]" />
              </div>
            </div>
          ))}
        </div>

        {/* Topic Tags Filtering Block */}
        <div className="flex flex-col gap-2 bg-[#121212] p-4 rounded-xl border border-[#1e1e1e]">
          <p className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-1">Filter by Topic</p>
          <div className="flex flex-wrap gap-2 max-h-[88px] overflow-y-auto pr-1">
            {TOPIC_TAGS.map((tag) => (
              <button
                key={tag.name}
                onClick={() => {
                  setSelectedTopic(selectedTopic === tag.name ? null : tag.name);
                  setSelectedCompany(null);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedTopic === tag.name 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-[#1e1e1e]/60 text-[#a0a0a0] hover:text-[#f5f5f5] border border-transparent hover:border-[#2e2e2e]'
                }`}
              >
                <span>{tag.name}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  selectedTopic === tag.name ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#1e1e1e] text-[#707070]'
                }`}>{tag.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categorization Toolbar */}
        <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-1">
          <div className="flex items-center gap-2 overflow-x-auto pr-2 scrollbar-none">
            {['All Topics', 'Algorithms', 'Database', 'Shell', 'Concurrency'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative text-xs px-3 py-2.5 transition-colors whitespace-nowrap ${
                  selectedCategory === cat ? 'text-[#f5f5f5] font-medium' : 'text-[#a0a0a0] hover:text-[#f5f5f5]'
                }`}
              >
                {cat}
                {selectedCategory === cat && (
                  <motion.div 
                    layoutId="activeCategoryBorder" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sub-Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121212]/40 p-1.5 rounded-xl border border-[#1e1e1e]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
            <input 
              type="text" 
              placeholder="Search questions by index or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#1e1e1e] focus:border-[#3e3e3e] focus:outline-none rounded-lg pl-10 pr-4 py-2 text-xs text-[#f5f5f5] placeholder-[#707070] transition-colors"
            />
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-xs text-[#a0a0a0]">
            <button 
              onClick={() => handleSort('acceptance')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                sortBy === 'acceptance' ? 'bg-[#1e1e1e] border-[#2e2e2e] text-[#f5f5f5]' : 'border-transparent hover:bg-[#1e1e1e]/40'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#707070]" />
              <span>Sort by Acc</span>
              {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            <div className="h-4 w-px bg-[#1e1e1e]" />

            <div className="flex items-center gap-1 bg-[#1e1e1e]/60 px-3 py-2 rounded-lg border border-[#1e1e1e]">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{solvedCount}/{PROBLEMS_DATA.length} Solved</span>
            </div>
          </div>
        </div>

        {/* Problems Data Grid (Tabular Structure) */}
        <div className="overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#0c0c0c]" id="problems_grid">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1e1e1e] bg-[#121212]/50 text-[#707070] font-mono select-none">
                  <th className="py-3.5 pl-4 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4 w-20 cursor-pointer hover:text-[#f5f5f5]" onClick={() => handleSort('id')}>
                    Index {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4 w-28 cursor-pointer hover:text-[#f5f5f5]" onClick={() => handleSort('acceptance')}>
                    Acceptance {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-4 w-28 cursor-pointer hover:text-[#f5f5f5]" onClick={() => handleSort('difficulty')}>
                    Difficulty {sortBy === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 pr-4 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#707070] font-mono">
                      No problems found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((prob) => {
                    const isSolved = solvedProblemIds.includes(prob.id) || prob.solved;
                    
                    return (
                      <tr 
                        key={prob.id}
                        onClick={() => onSelectProblem(prob.id)}
                        className="hover:bg-[#121212]/70 active:bg-[#1a1a1a] transition-colors cursor-pointer group"
                      >
                        <td className="py-4 pl-4 text-center">
                          {isSolved ? (
                            <CheckCircle className="w-4 h-4 text-[#00b8a3] mx-auto fill-[#00b8a3]/10" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#2e2e2e] mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-[#a0a0a0]">{prob.id}</td>
                        <td className="py-4 px-4 font-medium text-[#f5f5f5] group-hover:text-emerald-400 transition-colors">
                          {prob.title}
                        </td>
                        <td className="py-4 px-4 font-mono text-[#a0a0a0]">{prob.acceptance}</td>
                        <td className="py-4 px-4">
                          <span 
                            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 
                                prob.difficulty === 'Easy' ? '#00b8a315' : 
                                prob.difficulty === 'Medium' ? '#ffb80015' : '#ff2d5515',
                              color: 
                                prob.difficulty === 'Easy' ? '#00b8a3' : 
                                prob.difficulty === 'Medium' ? '#ffb800' : '#ff2d55',
                              border: `1px solid ${
                                prob.difficulty === 'Easy' ? '#00b8a325' : 
                                prob.difficulty === 'Medium' ? '#ffb80025' : '#ff2d5525'
                              }`
                            }}
                          >
                            {prob.difficulty}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button className="text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors p-1 rounded">
                            {isSolved ? <Unlock className="w-3.5 h-3.5 text-[#00b8a3]" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
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

      {/* 4. Interactive Widgets (Right Panel - 20% Width) */}
      <aside className="lg:col-span-2 flex flex-col gap-6" id="widgets_panel">
        
        {/* Calendar Module (Matrix Tracker July 2026) */}
        <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#f5f5f5]">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>July 2026</span>
            </div>
            <span className="text-[10px] font-mono text-[#a0a0a0]">Daily Challenge</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-[#707070]">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={idx} />;
              
              const isToday = day === currentDay;
              const isPast = day < currentDay;

              return (
                <div 
                  key={idx}
                  className={`relative aspect-square flex items-center justify-center rounded-full text-[10px] ${
                    isToday 
                      ? 'bg-emerald-500 text-black font-bold ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/20' 
                      : isPast
                        ? 'text-[#f5f5f5] hover:bg-[#1e1e1e]' 
                        : 'text-[#707070] hover:bg-[#1e1e1e]/40'
                  }`}
                  title={isToday ? "Active Daily Challenge Day!" : ""}
                >
                  {day}
                  {isToday && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Companies Module */}
        <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-[#f5f5f5] tracking-tight">Trending Companies</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#707070]" />
            <input 
              type="text" 
              placeholder="Search company..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#1e1e1e] focus:border-[#2e2e2e] focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-[#f5f5f5] placeholder-[#707070] transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
            {filteredCompanies.map((comp) => (
              <button
                key={comp.name}
                onClick={() => {
                  setSelectedCompany(selectedCompany === comp.name ? null : comp.name);
                  setSelectedTopic(null);
                }}
                className={`text-[10px] px-2 py-1 rounded transition-all flex items-center gap-1 ${
                  selectedCompany === comp.name 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-[#1e1e1e] text-[#a0a0a0] hover:text-[#f5f5f5] border border-transparent hover:border-[#2e2e2e]'
                }`}
              >
                <span>{comp.name}</span>
                <span className={`text-[9px] font-mono ${
                  selectedCompany === comp.name ? 'text-emerald-300' : 'text-[#707070]'
                }`}>{comp.frequency}</span>
              </button>
            ))}
            {filteredCompanies.length === 0 && (
              <p className="text-[10px] text-[#707070] font-mono text-center w-full py-2">No matches</p>
            )}
          </div>
        </div>
      </aside>

    </div>
  );
}
