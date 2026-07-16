'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CheckCircle2, ChevronRight, Award, Trophy, Compass, ShieldAlert, BookOpen, Star } from 'lucide-react';
import AppLayout from '@/src/components/AppLayout';
import { useGameState } from '@/src/lib/gameState';
import { PROBLEMS_DATA } from '@/src/data/data';
import Badge from '@/src/components/ui/Badge';
import Card from '@/src/components/ui/Card';

const PROBLEMS_PER_PAGE = 25;

export default function PracticeArenaPage() {
  const router = useRouter();
  const { solvedIds, solveProblem } = useGameState();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'acceptance' | 'difficulty'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('codenode_bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = (id: number) => {
    let current = [...bookmarks];
    if (current.includes(id)) {
      current = current.filter(x => x !== id);
    } else {
      current.push(id);
    }
    setBookmarks(current);
    localStorage.setItem('codenode_bookmarks', JSON.stringify(current));
  };

  /**
   * Called after a successful code submission API response.
   * Wire this to your submission flow — the shared game context
   * automatically propagates the update so the table re-renders
   * from empty circle to green checkmark without a refresh.
   *
   * Usage example after API returns { status: "Accepted" }:
   *
   *   handleSubmissionSuccess(probId, probDifficulty);
   */
  const handleSubmissionSuccess = (problemId: number, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    solveProblem(problemId, difficulty);
  };

  const solvedProblemIds = useMemo(() => solvedIds || [], [solvedIds]);

  // Filter & Sort logic
  const filteredProblems = useMemo(() => {
    return PROBLEMS_DATA.filter((prob) => {
      const matchesSearch = prob.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            prob.id.toString() === searchTerm.trim();
      const matchesTopic = !selectedTopic || prob.topics.includes(selectedTopic);
      const matchesDifficulty = !selectedDifficulty || prob.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'All Topics' || prob.category === selectedCategory;

      return matchesSearch && matchesTopic && matchesDifficulty && matchesCategory;
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
  }, [searchTerm, selectedTopic, selectedDifficulty, selectedCategory, sortBy, sortOrder]);

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

  const onSelectProblem = (id: number) => {
    router.push(`/problems/${id}`);
  };

  if (!isMounted) {
    return (
      <AppLayout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col gap-6 select-none font-sans">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider">Practice Mode</span>
          <h1 className="text-2xl font-black text-text-main tracking-tight">Practice Arena</h1>
          <p className="text-xs text-text-muted font-semibold">Solve curated algorithm and database challenges to level up your engineering skills.</p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card p-4 rounded-xl border border-border-card shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {['All Topics', 'Algorithms', 'Data Structures', 'Database'].map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                className={`text-[11px] font-mono font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === category 
                    ? 'bg-primary text-white border-primary shadow-sm' 
                    : 'bg-bg-base text-text-muted border-border-card/70 hover:bg-hover/40'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Difficulty Selector */}
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => { setSelectedDifficulty(e.target.value || null); setCurrentPage(1); }}
              className="bg-bg-base border border-border-card rounded-lg px-2.5 py-1.5 text-xs text-text-muted focus:outline-none cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
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
        </div>

        {/* Problems Table */}
        <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-border-card bg-bg-base/30 text-text-muted text-[10px] font-mono font-bold uppercase select-none">
                  <th className="py-3.5 px-4 w-14 text-center">Status</th>
                  <th className="py-3.5 px-4 w-14 text-center">Bookmark</th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('title')}>Title</th>
                  <th className="py-3.5 px-4 cursor-pointer text-center w-28" onClick={() => handleSort('difficulty')}>Difficulty</th>
                  <th className="py-3.5 px-4 cursor-pointer text-center w-28" onClick={() => handleSort('acceptance')}>Acceptance</th>
                  <th className="py-3.5 px-4 w-28 text-center">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/30">
                {paginatedProblems.length > 0 ? (
                  paginatedProblems.map((prob) => {
                    const isSolved = solvedProblemIds.includes(prob.id);
                    return (
                      <tr 
                        key={prob.id} 
                        onClick={() => onSelectProblem(prob.id)} 
                        className="hover:bg-hover/20 border-b border-border-card/20 last:border-0 transition-all duration-100 group cursor-pointer"
                      >
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center">
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-border-card" />
                            )}
                          </div>
                        </td>
                        <td 
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(prob.id);
                          }}
                        >
                          <div className="flex items-center justify-center cursor-pointer">
                            <Star className={`w-4 h-4 transition-colors ${
                              bookmarks.includes(prob.id) ? 'text-yellow-500 fill-yellow-500' : 'text-text-muted hover:text-yellow-500'
                            }`} />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[12.5px] font-bold text-text-main group-hover:text-primary transition-colors">
                            {prob.id}. {prob.title}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Medium' ? 'medium' : 'hard'}>
                            {prob.difficulty}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[11px] text-text-muted">
                          {prob.acceptance}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[9.5px] font-mono font-bold text-text-muted bg-hover/40 px-2 py-0.5 rounded border border-border-card/45">
                            {prob.category}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-text-muted">
                      No challenges found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-card px-4 py-3 bg-bg-base/20 select-none">
              <span className="text-[10px] font-mono text-text-muted font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 rounded border border-border-card bg-bg-card text-text-main hover:bg-hover text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Prev
                </button>
                {pageNumbers.map((num, i) => (
                  <button
                    key={i}
                    disabled={num === -1 || num === -2}
                    onClick={() => num > 0 && setCurrentPage(num)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      num === currentPage
                        ? 'bg-primary text-white border border-primary'
                        : num < 0
                          ? 'text-text-muted border-0 cursor-default'
                          : 'border border-border-card bg-bg-card text-text-main hover:bg-hover cursor-pointer'
                    }`}
                  >
                    {num < 0 ? '...' : num}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1 rounded border border-border-card bg-bg-card text-text-main hover:bg-hover text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
