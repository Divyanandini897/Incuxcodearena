'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  CheckCircle, 
  Calendar, 
  SlidersHorizontal, 
  Compass, 
  Sparkles, 
  Coins,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { PROBLEMS_DATA, TOPIC_TAGS, COMPANIES_LIST } from '../data/data';
import { useGameState } from '../lib/gameState';
import { useRouter } from 'next/navigation';

interface DashboardProps {
  solvedProblemIds: number[];
  onSelectProblem: (id: number) => void;
}

const PROBLEMS_PER_PAGE = 50;

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
    desc: 'Master data cleaning scripts, classical predictor training, and neural networks tuning.',
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companySearch, setCompanySearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'acceptance' | 'difficulty'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  // Consume our gamified context
  const { theme, userName } = useGameState();

  // Dynamic Daily Challenge (First unsolved problem)
  const activeQuest = useMemo(() => {
    return PROBLEMS_DATA.find(p => !solvedProblemIds.includes(p.id)) || PROBLEMS_DATA[0];
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

  // Companies frequency listing
  const filteredCompanies = useMemo(() => {
    return COMPANIES_LIST.filter(c => 
      c.name.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companySearch]);

  const getDifficultyType = (difficulty: Difficulty) => {
    if (difficulty === 'Easy') return { name: 'Easy', color: 'text-primary' };
    if (difficulty === 'Medium') return { name: 'Medium', color: 'text-amber-500' };
    return { name: 'Hard', color: 'text-red-500' };
  };

  const handleSort = (field: 'id' | 'title' | 'acceptance' | 'difficulty') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-64px)] font-sans px-2">
      
      {/* 1. Main Feed (9/12 Width) - Daily Challenge & Problems List */}
      <main className="lg:col-span-9 flex flex-col gap-8" id="core_feed">
        
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

        {/* Career Role Journeys Grid */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider font-extrabold">Career Role Journeys</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAREER_ROLES.map((role) => (
              <div 
                key={role.id}
                onClick={() => router.push(`/journey/${role.id}`)}
                className="flex flex-col gap-3.5 p-6 rounded-xl border border-border-card/60 bg-bg-card shadow-sm hover:shadow hover:border-primary/30 transition-all duration-300 hover:scale-[1.012] cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-text-main group-hover:text-primary transition-colors">
                    {role.title}
                  </h4>
                  <span className="text-[9px] font-mono bg-bg-base px-1.5 py-0.5 rounded text-text-muted border border-border-card/45 select-none uppercase font-bold">
                    Journey
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-semibold line-clamp-3 h-13.5">
                  {role.desc}
                </p>
                <div className="text-xs font-mono font-bold text-primary flex items-center gap-1 mt-1">
                  <span>View Roadmap &gt;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Programming Languages Course Progress Grid */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider font-extrabold">Language Course Progress</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'C++', total: 10, color: 'border-cyan-500/20 text-cyan-600 bg-cyan-500/5', barColor: 'bg-cyan-500' },
              { name: 'Python', total: 8, color: 'border-blue-500/20 text-blue-600 bg-blue-500/5', barColor: 'bg-blue-500' },
              { name: 'Java', total: 12, color: 'border-orange-500/20 text-orange-600 bg-orange-500/5', barColor: 'bg-orange-500' },
              { name: 'JavaScript', total: 6, color: 'border-amber-500/20 text-amber-600 bg-amber-500/5', barColor: 'bg-amber-500' },
            ].map((lang) => {
              const solvedCount = solvedProblemIds.length;
              const progressPercent = Math.min(100, Math.floor((solvedCount / lang.total) * 100));

              return (
                <div 
                  key={lang.name}
                  className="flex flex-col gap-3.5 p-6 rounded-xl border border-border-card/60 bg-bg-card shadow-sm hover:shadow transition-all duration-300 hover:scale-[1.012]"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border ${lang.color}`}>
                      {lang.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1 font-mono text-xs">
                    <div className="flex justify-between font-extrabold text-text-main">
                      <span>Progress</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-bg-base rounded-full overflow-hidden border border-border-card/30 p-[1px]">
                      <div 
                        className={`h-full ${lang.barColor} rounded-full transition-all duration-700`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Tags Filtering Block */}
        <div className="flex flex-col gap-2 bg-bg-card p-4 rounded-xl border border-border-card/60 glow-border">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1 font-bold">Filter by Topic</p>
          <div className="flex flex-wrap gap-2 max-h-[88px] overflow-y-auto pr-1">
            {TOPIC_TAGS.map((tag) => {
              const isActive = selectedTopic === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() => {
                    setSelectedTopic(isActive ? null : tag.name);
                    setCurrentPage(1);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                    isActive 
                      ? 'bg-primary/20 text-primary border border-primary/30 font-extrabold' 
                      : 'bg-bg-base/60 text-text-muted hover:text-text-main border border-transparent hover:border-border-card'
                  }`}
                >
                  <span>{tag.name}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-primary/20 text-primary' : 'bg-bg-card text-text-muted/60 border border-border-card/30'
                  }`}>{tag.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categorization Toolbar tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card p-5 rounded-xl border border-border-card glow-border">
          <div className="flex flex-wrap items-center gap-3">
            {['All Topics', 'Algorithms', 'Data Structures', 'Database'].map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedCompany(null);
                  setSelectedTopic(null);
                  setCurrentPage(1);
                }}
                className={`text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer font-extrabold tracking-tight ${
                  selectedCategory === category 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-bg-base text-text-muted hover:text-text-main hover:bg-bg-base/80 border border-border-card/45'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted/70" />
              <input
                type="text"
                placeholder="Search question name or number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-bg-base border border-border-card focus:border-primary/40 focus:outline-none rounded-lg pl-10 pr-4 py-2.5 text-xs text-text-main placeholder-text-muted/50 transition-colors font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Search & Sub-Filters Toolbar (Difficulty buttons & Stats) */}
        <div className="flex flex-col gap-3 bg-bg-card p-4 rounded-xl border border-border-card/60 glow-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-extrabold">Difficulty:</span>
            {([null, 'Easy', 'Medium', 'Hard'] as (string | null)[]).map((diff) => {
              const isActive = selectedDifficulty === diff;
              const color = diff === 'Easy' ? { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' }
                          : diff === 'Medium' ? { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
                          : diff === 'Hard' ? { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' }
                          : { text: 'text-text-muted', bg: 'bg-bg-base', border: 'border-border-card' };
              return (
                <button
                  key={diff ?? 'all'}
                  onClick={() => {
                    setSelectedDifficulty(isActive ? null : diff);
                    setCurrentPage(1);
                  }}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    isActive ? `${color.text} ${color.bg} ${color.border}` : 'border-border-card text-text-muted hover:text-text-main'
                  }`}
                >
                  {diff ?? 'All'}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2 font-mono text-xs shrink-0">
              <div className="flex items-center gap-1.5 bg-bg-base px-3 py-1.5 rounded-lg border border-border-card/50 text-text-muted font-bold">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{solvedProblemIds.length}<span className="text-text-muted/50">/{PROBLEMS_DATA.length}</span> Solved</span>
              </div>
              <div className="flex items-center gap-1.5 bg-bg-base px-3 py-1.5 rounded-lg border border-border-card/50 text-text-muted font-bold">
                <span>{filteredProblems.length} results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Problems Table List */}
        <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden glow-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-card/85 bg-bg-base/40 text-text-muted text-[11px] font-mono font-bold uppercase tracking-wider select-none">
                  <th className="py-4.5 px-4 w-16 text-center">Status</th>
                  <th className="py-4.5 px-4 cursor-pointer hover:text-text-main transition-colors" onClick={() => handleSort('title')}>
                    Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4.5 px-4 w-32 cursor-pointer hover:text-text-main transition-colors" onClick={() => handleSort('acceptance')}>
                    Acceptance {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4.5 px-4 w-36 cursor-pointer hover:text-text-main transition-colors" onClick={() => handleSort('difficulty')}>
                    Difficulty {sortBy === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4.5 pr-4 w-28 text-center">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/45 text-xs select-none">
                {paginatedProblems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted font-mono">
                      No problems found matching active filters.
                    </td>
                  </tr>
                ) : (
                  paginatedProblems.map((prob) => {
                    const isSolved = solvedProblemIds.includes(prob.id);
                    const diffTag = getDifficultyType(prob.difficulty);
                    
                    return (
                      <tr 
                        key={prob.id}
                        onClick={() => onSelectProblem(prob.id)}
                        className="hover:bg-bg-base/20 transition-colors group cursor-pointer"
                      >
                        {/* Status Checkbox */}
                        <td className="py-5 px-4 text-center">
                          <div className="flex items-center justify-center">
                            {isSolved ? (
                              <CheckCircle className="w-5 h-5 text-primary fill-primary/10 animate-wiggle" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-border-card/90 group-hover:border-primary transition-colors bg-bg-base" />
                            )}
                          </div>
                        </td>
                        
                        {/* Title Column */}
                        <td className="py-5 px-4 font-extrabold text-text-main text-base group-hover:text-primary transition-colors">
                          <span className="text-text-muted/65 font-mono mr-1">{prob.id}.</span>
                          <span>{prob.title}</span>
                          <div className="flex gap-2 mt-1.5 select-none font-semibold">
                            <span className="text-[10px] font-mono text-text-muted bg-bg-base px-2 py-0.5 rounded border border-border-card/50 uppercase">
                              {prob.category}
                            </span>
                            {prob.topics.slice(0, 2).map(tag => (
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
                          <span className={`font-black ${diffTag.color}`}>
                            {diffTag.name}
                          </span>
                        </td>
                        
                        {/* Action reward gold */}
                        <td className="py-5 pr-4 text-center text-xs font-mono font-extrabold text-yellow-600">
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-3 font-mono text-xs text-text-muted select-none mt-4">
            {/* Left: range label */}
            <span>
              Showing{' '}
              <span className="text-text-main font-bold">
                {(currentPage - 1) * PROBLEMS_PER_PAGE + 1}–{Math.min(currentPage * PROBLEMS_PER_PAGE, filteredProblems.length)}
              </span>{' '}
              of <span className="text-text-main font-bold">{filteredProblems.length}</span>
            </span>

            {/* Right: page buttons */}
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-card/65 bg-bg-card text-text-muted hover:text-text-main disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Page number buttons */}
              {pageNumbers.map((page, idx) =>
                page < 0 ? (
                  <span key={`ellipsis-${idx}`} className="px-1 select-none">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg border transition-all cursor-pointer font-bold ${
                      currentPage === page
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'border-border-card/65 hover:bg-bg-base/40 text-text-muted hover:text-text-main'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-card/65 bg-bg-card text-text-muted hover:text-text-main disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer font-bold"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 2. Sidebar Panel (3/12 Width) - Top Company Prep & Target Companies */}
      <aside className="lg:col-span-3 flex flex-col gap-8 text-sm" id="sidebar_nav">
        
        {/* Top Company Prep (In place of study track) */}
        <div className="bg-bg-card rounded-xl border border-border-card p-5 flex flex-col gap-4 glow-border">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider font-extrabold">Top Company Prep</p>
          <div className="flex flex-col gap-2">
            {['Google', 'Deloitte', 'Microsoft', 'Amazon'].map((companyName) => {
              const isActive = selectedCompany === companyName;
              return (
                <button 
                  key={companyName}
                  onClick={() => { 
                    setSelectedCompany(isActive ? null : companyName); 
                    setSelectedTopic(null);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all cursor-pointer text-sm font-bold ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 font-extrabold' 
                      : 'text-text-muted hover:text-text-main hover:bg-bg-base/40 border border-transparent'
                  }`}
                >
                  <span className="truncate">{companyName} Prep</span>
                  <span className="text-xs font-mono bg-bg-base px-2 py-0.5 rounded border border-border-card text-text-muted font-bold">
                    {companyName === 'Google' ? 2318 : companyName === 'Deloitte' ? 32 : companyName === 'Microsoft' ? 840 : 1240}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Companies Search Filter */}
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
                  setCurrentPage(1);
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
