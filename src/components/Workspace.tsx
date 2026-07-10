'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  Check, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Settings, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Clock, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  Globe, 
  Lightbulb, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { Problem, EvaluationResult, EditorialResponse, HintResponse } from '../types';

interface WorkspaceProps {
  problemId: number;
  problems: Problem[];
  solvedProblemIds: number[];
  onBackToDashboard: () => void;
  onMarkSolved: (id: number) => void;
}

export default function Workspace({ 
  problemId, 
  problems, 
  solvedProblemIds, 
  onBackToDashboard, 
  onMarkSolved 
}: WorkspaceProps) {
  const problem = problems.find((p) => p.id === problemId);
  if (!problem) return null;

  // Layout Splitting
  const [splitPercent, setSplitPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIdeFullscreen, setIsIdeFullscreen] = useState(false);

  // Tabs Left Panel
  const [activeTab, setActiveTab] = useState<'Description' | 'Editorial' | 'Solutions' | 'Submissions'>('Description');

  // Interactive Metadata States
  const [showTopics, setShowTopics] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [upvotes, setUpvotes] = useState(1420);
  const [downvotes, setDownvotes] = useState(25);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);

  // IDE Editor State
  const [language, setLanguage] = useState('C++');
  const [userCode, setUserCode] = useState('');
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize language from URL parameter on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlLang = searchParams.get('lang')?.toLowerCase();
      if (urlLang) {
        const langMap: Record<string, string> = {
          javascript: 'JavaScript',
          python: 'Python',
          java: 'Java',
          cpp: 'C++',
          go: 'Go',
        };
        const mappedLang = langMap[urlLang];
        if (mappedLang) {
          setLanguage(mappedLang);
        }
      }
    }
  }, []);

  // Terminal & Execution State
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'Testcase' | 'Test Result'>('Testcase');
  const [customTestcaseInput, setCustomTestcaseInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [editorialData, setEditorialData] = useState<EditorialResponse | null>(null);
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(false);

  // Local submission history
  const [submissionHistory, setSubmissionHistory] = useState<{
    timestamp: string;
    status: string;
    runtime: string;
    memory: string;
    language: string;
  }[]>([]);

  // Synchronize start codes on problem/language change
  useEffect(() => {
    const savedCodeKey = `leetcode_code_${problemId}_${language}`;
    const savedCode = localStorage.getItem(savedCodeKey);
    if (savedCode) {
      setUserCode(savedCode);
    } else {
      setUserCode(problem.starterCode[language] || problem.starterCode['C++'] || '');
    }
    
    // Set custom testcase input to default
    if (problem.testcases && problem.testcases.length > 0) {
      setCustomTestcaseInput(problem.testcases[0].input);
    }
    
    setHintText(null);
    setEvaluationResult(null);
  }, [problemId, language, problem]);

  // Line number update listener
  useEffect(() => {
    const lines = userCode.split('\n');
    setLineNumbers(Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1));

    // Save code mock auto-save
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem(`leetcode_code_${problemId}_${language}`, userCode);
      setIsSaving(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [userCode, problemId, language]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const nextPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        if (nextPercent > 25 && nextPercent < 75) {
          setSplitPercent(nextPercent);
        }
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Reset current language snippet
  const handleResetSnippet = () => {
    if (window.confirm('Are you sure you want to reset your code to the default boilerplate?')) {
      const defaultSnippet = problem.starterCode[language] || problem.starterCode['C++'] || '';
      setUserCode(defaultSnippet);
      localStorage.removeItem(`leetcode_code_${problemId}_${language}`);
    }
  };

  // Fetch hint
  const handleFetchHint = async () => {
    if (isLoadingHint) return;
    setIsLoadingHint(true);
    setHintText(null);

    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          code: userCode,
          language
        })
      });
      const data: HintResponse = await res.json();
      setHintText(data.hint);
    } catch (err) {
      console.error(err);
      setHintText('Hint: Check for character occurrences in your window boundaries!');
    } finally {
      setIsLoadingHint(false);
    }
  };

  // Fetch Editorial
  useEffect(() => {
    if (activeTab === 'Editorial' && !editorialData) {
      const fetchEditorial = async () => {
        setIsLoadingEditorial(true);
        try {
          const res = await fetch('/api/editorial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              problemId: problem.id,
              language
            })
          });
          const data: EditorialResponse = await res.json();
          setEditorialData(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingEditorial(false);
        }
      };
      fetchEditorial();
    }
  }, [activeTab, problemId, language, editorialData, problem]);

  // Code Execution (Run / Submit)
  const handleEvaluate = async (action: 'run' | 'submit') => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setIsTerminalExpanded(true);
    setActiveConsoleTab('Test Result');
    setEvaluationResult(null);

    try {
      const isCustom = activeConsoleTab === 'Testcase' && customTestcaseInput.trim() !== '';
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code: userCode,
          action,
          customInput: isCustom ? customTestcaseInput : undefined
        })
      });

      const result: EvaluationResult = await res.json();
      setEvaluationResult(result);

      if (action === 'submit' && result.status === 'Accepted') {
        onMarkSolved(problem.id);
      }

      // Append to local submission tracker
      if (action === 'submit') {
        setSubmissionHistory(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            status: result.status,
            runtime: result.runtime || '4ms',
            memory: result.memory || '10.2MB',
            language
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error(err);
      setEvaluationResult({
        status: 'Runtime Error',
        compileError: 'Server failed to respond. Please check your internet connection or developer API Key.',
        testResults: []
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(prev => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      if (hasDownvoted) {
        setDownvotes(prev => prev - 1);
        setHasDownvoted(false);
      }
    }
  };

  const handleDownvote = () => {
    if (hasDownvoted) {
      setDownvotes(prev => prev - 1);
      setHasDownvoted(false);
    } else {
      setDownvotes(prev => prev + 1);
      setHasDownvoted(true);
      if (hasUpvoted) {
        setUpvotes(prev => prev - 1);
        setHasUpvoted(false);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-[calc(100vh-56px)] select-none bg-[#0a0a0a] overflow-hidden"
    >
      
      {/* Mini Workspace Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#0c0c0c] px-4 py-2 text-xs font-sans">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#1e1e1e] text-[#a0a0a0] hover:text-[#f5f5f5] transition-all font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Problem List</span>
          </button>
          <div className="h-4 w-px bg-[#1e1e1e]" />
          <span className="font-semibold text-[#f5f5f5] tracking-tight truncate max-w-[200px] md:max-w-none">
            {problem.id}. {problem.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
            Standard Environment
          </span>
        </div>
      </div>

      {/* Workspace Split Body */}
      <div className="flex flex-1 w-full relative overflow-hidden">
        
        {/* Left Column: Problem Specification Workspace */}
        <div 
          className="h-full flex flex-col bg-[#0f0f0f] relative border-r border-[#1e1e1e]"
          style={{ width: isIdeFullscreen ? '0%' : `${splitPercent}%`, display: isIdeFullscreen ? 'none' : 'flex' }}
        >
          {/* Flat Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#0c0c0c] px-4 text-xs font-mono">
            <div className="flex items-center gap-4">
              {(['Description', 'Editorial', 'Solutions', 'Submissions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 relative transition-colors ${
                    activeTab === tab ? 'text-[#f5f5f5] font-medium' : 'text-[#707070] hover:text-[#f5f5f5]'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeWorkspaceTabBorder" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Columns */}
          <div className="flex-1 overflow-y-auto p-5 font-sans relative flex flex-col gap-6" id="problem_specification">
            
            <AnimatePresence mode="wait">
              {activeTab === 'Description' && (
                <motion.div 
                  key="desc"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-5 text-sm leading-relaxed"
                >
                  {/* Metadata Header */}
                  <div className="flex flex-col gap-3">
                    <h1 className="text-xl font-bold text-[#f5f5f5] tracking-tight">
                      {problem.id}. {problem.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span 
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: 
                            problem.difficulty === 'Easy' ? '#00b8a310' : 
                            problem.difficulty === 'Medium' ? '#ffb80010' : '#ff2d5510',
                          color: 
                            problem.difficulty === 'Easy' ? '#00b8a3' : 
                            problem.difficulty === 'Medium' ? '#ffb800' : '#ff2d55',
                          borderColor: 
                            problem.difficulty === 'Easy' ? '#00b8a320' : 
                            problem.difficulty === 'Medium' ? '#ffb80020' : '#ff2d5520',
                        }}
                      >
                        {problem.difficulty}
                      </span>

                      {/* Topics dropdown */}
                      <div className="relative">
                        <button 
                          onClick={() => { setShowTopics(!showTopics); setShowCompanies(false); }}
                          className="flex items-center gap-1 text-[10px] bg-[#1e1e1e] hover:bg-[#2e2e2e] transition-colors text-[#a0a0a0] hover:text-[#f5f5f5] px-2.5 py-1 rounded"
                        >
                          <span>Topics</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {showTopics && (
                          <div className="absolute top-7 left-0 bg-[#121212] border border-[#2e2e2e] rounded shadow-xl p-2.5 z-30 flex flex-wrap gap-1.5 w-52">
                            {problem.topics.map((t) => (
                              <span key={t} className="text-[10px] bg-[#1e1e1e] text-[#a0a0a0] px-2 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Companies dropdown */}
                      <div className="relative">
                        <button 
                          onClick={() => { setShowCompanies(!showCompanies); setShowTopics(false); }}
                          className="flex items-center gap-1 text-[10px] bg-[#1e1e1e] hover:bg-[#2e2e2e] transition-colors text-[#a0a0a0] hover:text-[#f5f5f5] px-2.5 py-1 rounded"
                        >
                          <span>Companies</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {showCompanies && (
                          <div className="absolute top-7 left-0 bg-[#121212] border border-[#2e2e2e] rounded shadow-xl p-2.5 z-30 flex flex-col gap-1.5 w-48 font-mono text-[10px]">
                            {problem.companies.map((c) => (
                              <div key={c.name} className="flex justify-between items-center text-[#a0a0a0]">
                                <span>{c.name}</span>
                                <span className="text-emerald-400">Freq {c.frequency}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Hint Button */}
                      <button 
                        onClick={handleFetchHint}
                        disabled={isLoadingHint}
                        className="flex items-center gap-1 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded border border-amber-500/10 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3 h-3" />
                        <span>{isLoadingHint ? 'Generating Hint...' : 'Hint'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Hint Panel */}
                  <AnimatePresence>
                    {hintText && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-200">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-amber-300">Code Analysis Hint</span>
                            <p className="leading-relaxed">{hintText}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {problem.description === "Problem details coming soon!" ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-[#121212]/30 border border-[#1e1e1e] rounded-2xl">
                      <AlertCircle className="w-12 h-12 text-[#ffb800] mb-4 opacity-80" />
                      <h3 className="text-sm font-semibold text-[#f5f5f5] mb-2">Problem Details Coming Soon</h3>
                      <p className="text-xs text-[#707070] max-w-xs leading-relaxed">
                        We are currently preparing the description, test cases, and community editorials for this problem. You can still write and edit code in the IDE panel!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Description Markdown Render Box */}
                      <div className="text-xs text-[#d0d0d0] leading-relaxed flex flex-col gap-4">
                        {problem.description.split('\n\n').map((paragraph, i) => {
                          // Simple inline monospace parsing for prompt text `s` or indices
                          const processedText = paragraph.replace(/`([^`]+)`/g, '<code class="font-mono bg-[#1e1e1e] px-1.5 py-0.5 rounded text-emerald-400 text-[10px]">$1</code>');
                          return (
                            <p 
                              key={i} 
                              dangerouslySetInnerHTML={{ __html: processedText }}
                            />
                          );
                        })}
                      </div>

                      {/* Examples Execution Blocks */}
                      <div className="flex flex-col gap-4">
                        <p className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">Example Executions</p>
                        {problem.examples.map((ex, idx) => (
                          <div 
                            key={idx}
                            className="bg-[#121212] border border-[#1e1e1e] rounded-xl p-4 flex flex-col gap-2 text-xs font-mono"
                          >
                            <p className="font-semibold text-emerald-400">Example {idx + 1}:</p>
                            <div className="grid grid-cols-1 gap-1 text-[#b0b0b0] pl-2 border-l-2 border-[#2e2e2e]">
                              <div>
                                <span className="text-[#707070]">Input:</span> {ex.input}
                              </div>
                              <div>
                                <span className="text-[#707070]">Output:</span> {ex.output}
                              </div>
                              {ex.explanation && (
                                <div className="mt-1 leading-relaxed">
                                  <span className="text-[#707070]">Explanation:</span> {ex.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                </motion.div>
              )}

              {activeTab === 'Editorial' && (
                <motion.div 
                  key="editorial"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-5 text-sm"
                >
                  <h2 className="text-lg font-bold text-[#f5f5f5]">Official Editorial Analysis</h2>
                  {isLoadingEditorial ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs text-[#a0a0a0] font-mono">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      <span>Synthesizing optimal strategy from server...</span>
                    </div>
                  ) : editorialData ? (
                    <div className="flex flex-col gap-6 text-xs text-[#c0c0c0] leading-relaxed">
                      
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex flex-col gap-2">
                        <h3 className="font-semibold text-[#f5f5f5] text-sm">Optimal Intuiton</h3>
                        <div className="text-xs leading-relaxed flex flex-col gap-3">
                          {editorialData.approach.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      </div>

                      <div className="border border-[#1e1e1e] rounded-xl p-4 bg-[#121212]/50 flex flex-col gap-2 font-mono">
                        <h3 className="font-semibold text-[#f5f5f5] text-xs uppercase tracking-wider text-[#a0a0a0]">Complexity Bound</h3>
                        <p dangerouslySetInnerHTML={{ __html: editorialData.complexity.replace(/\$([^\$]+)\$/g, '<code class="text-emerald-400">$1</code>') }} />
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-[#f5f5f5]">Optimal Solution Code ({language})</h3>
                        <pre className="p-4 bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl overflow-x-auto text-[#00b8a3] font-mono">
                          {editorialData.codeSolution}
                        </pre>
                      </div>

                    </div>
                  ) : (
                    <p className="text-xs text-[#707070] font-mono">Failed to retrieve editorial strategists. Check server configurations.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'Solutions' && (
                <motion.div 
                  key="sol"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-5 text-sm"
                >
                  <h2 className="text-lg font-bold text-[#f5f5f5]">Community Solutions</h2>
                  
                  <div className="flex flex-col gap-4">
                    <div className="border border-[#1e1e1e] bg-[#121212]/50 p-4 rounded-xl flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#f5f5f5]">🚀 Sliding Window [O(N)] - C++ Beats 98% Runtime</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">Optimal</span>
                      </div>
                      <p className="text-[#a0a0a0] leading-relaxed">
                        A highly clean one-pass scan tracking occurrences using an array map for maximum memory cache locality.
                      </p>
                      <div className="flex items-center gap-4 text-[#707070] mt-2 font-mono text-[10px]">
                        <span>By code_wizard</span>
                        <span>👍 4,210 upvotes</span>
                        <span>💬 322 comments</span>
                      </div>
                    </div>

                    <div className="border border-[#1e1e1e] bg-[#121212]/50 p-4 rounded-xl flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#f5f5f5]">🐍 Python3 Simple Sliding Window & Set [Detailed Comments]</span>
                        <span className="text-[10px] font-mono text-[#a0a0a0] bg-[#1e1e1e] px-1.5 py-0.2 rounded">Python</span>
                      </div>
                      <p className="text-[#a0a0a0] leading-relaxed">
                        Easy to understand Python loop keeping elements inside a standard set utility, shrinking left dynamically.
                      </p>
                      <div className="flex items-center gap-4 text-[#707070] mt-2 font-mono text-[10px]">
                        <span>By py_compiler</span>
                        <span>👍 1,984 upvotes</span>
                        <span>💬 84 comments</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Submissions' && (
                <motion.div 
                  key="sub"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col gap-4 text-sm font-mono"
                >
                  <h2 className="text-lg font-bold text-[#f5f5f5] font-sans">Submission History</h2>

                  {submissionHistory.length === 0 ? (
                    <div className="py-12 text-center text-[#707070]">
                      No submissions sent in this session yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {submissionHistory.map((sub, i) => (
                        <div 
                          key={i}
                          className="border border-[#1e1e1e] bg-[#121212]/40 p-4 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex flex-col gap-1">
                            <span 
                              className={`font-semibold text-sm ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-500'}`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-[#707070] text-[10px]">{sub.timestamp} • Language: {sub.language}</span>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] text-[#a0a0a0]">
                            <div>
                              <span className="text-[#707070]">Runtime:</span> {sub.runtime}
                            </div>
                            <div>
                              <span className="text-[#707070]">Memory:</span> {sub.memory}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Footer Status Bar Left */}
          <div className="border-t border-[#1e1e1e] bg-[#0c0c0c] px-4 py-3 flex items-center justify-between text-xs text-[#707070]">
            <div className="flex items-center gap-4 font-mono">
              <button 
                onClick={handleUpvote}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                  hasUpvoted ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-[#f5f5f5] hover:bg-[#1e1e1e]'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{upvotes}</span>
              </button>

              <button 
                onClick={handleDownvote}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                  hasDownvoted ? 'text-rose-500 bg-rose-500/10' : 'hover:text-[#f5f5f5] hover:bg-[#1e1e1e]'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{downvotes}</span>
              </button>

              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>2.4K Comments</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px]">1,420 users active</span>
            </div>
          </div>

        </div>

        {/* 2. Resizable Vertical Divider handle */}
        <div 
          className="w-1.5 bg-[#121212] hover:bg-emerald-500/40 active:bg-emerald-500 cursor-col-resize transition-colors z-20 flex items-center justify-center"
          onMouseDown={handleMouseDown}
          style={{ display: isIdeFullscreen ? 'none' : 'flex' }}
        >
          <div className="w-px h-6 bg-[#2e2e2e]" />
        </div>

        {/* Right Column: Code IDE & Sandbox Terminal */}
        <div 
          className="h-full flex flex-col bg-[#0a0a0a]"
          style={{ width: isIdeFullscreen ? '100%' : `${100 - splitPercent}%` }}
        >
          
          {/* IDE Workspace Header */}
          <div className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#0c0c0c] px-4 py-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#121212] border border-[#2e2e2e] focus:outline-none rounded text-xs text-[#f5f5f5] px-3 py-1 pr-6 cursor-pointer appearance-none font-mono"
                >
                  {['C++', 'Python', 'Java', 'JavaScript', 'Go'].map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#707070] pointer-events-none" />
              </div>

              <span className="text-[10px] font-mono text-[#707070]">
                {isSaving ? 'Saving...' : 'Auto Saved'}
              </span>
            </div>

            {/* Layout controls */}
            <div className="flex items-center gap-1 text-[#707070]">
              <button 
                onClick={handleResetSnippet}
                title="Reset code template"
                className="hover:text-[#f5f5f5] hover:bg-[#1e1e1e] p-1.5 rounded transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => setIsIdeFullscreen(!isIdeFullscreen)}
                title={isIdeFullscreen ? "Exit Fullscreen" : "Fullscreen Code IDE"}
                className="hover:text-[#f5f5f5] hover:bg-[#1e1e1e] p-1.5 rounded transition-colors cursor-pointer"
              >
                {isIdeFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-emerald-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button 
                title="Workspace settings"
                className="hover:text-[#f5f5f5] hover:bg-[#1e1e1e] p-1.5 rounded transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Code Input Console Window (With sequential vertical line numbers) */}
          <div className="flex-1 overflow-hidden relative flex text-sm font-mono bg-[#050505]" id="code_ide">
            
            {/* Sequential Line Numbering System */}
            <div className="w-12 bg-[#080808] text-[#444444] text-right pr-3 select-none py-4 border-r border-[#151515] flex flex-col overflow-hidden">
              {lineNumbers.map((num) => (
                <div key={num} className="h-[21px] leading-[21px] text-[11px] pr-0.5">
                  {num}
                </div>
              ))}
            </div>

            {/* Custom styled text editor */}
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent text-[#00ffcc] focus:outline-none resize-none p-4 leading-[21px] text-[13px] font-mono h-full overflow-y-auto"
              style={{ caretColor: '#00ffcc' }}
              placeholder="// Write your code here..."
            />
          </div>

          {/* Collapsible Execution Console Terminal */}
          <div 
            className="border-t border-[#1e1e1e] bg-[#0c0c0c] flex flex-col overflow-hidden"
            style={{ height: isTerminalExpanded ? '260px' : '40px' }}
          >
            {/* Headers for Console panel */}
            <div 
              onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
              className="flex items-center justify-between px-4 h-10 border-b border-[#1e1e1e] hover:bg-[#121212] transition-colors cursor-pointer select-none text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[#f5f5f5] font-mono">
                  <Terminal className="w-4 h-4 text-[#a0a0a0]" />
                  <span>Terminal</span>
                </div>
                <div className="h-3 w-px bg-[#2e2e2e]" />
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  {(['Testcase', 'Test Result'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveConsoleTab(tab);
                        setIsTerminalExpanded(true);
                      }}
                      className={`font-mono transition-colors py-1 ${
                        activeConsoleTab === tab ? 'text-[#f5f5f5] font-semibold' : 'text-[#707070] hover:text-[#f5f5f5]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {isTerminalExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[#707070]" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-[#707070]" />
                )}
              </div>
            </div>

            {/* Interactive Terminal Inner Content */}
            {isTerminalExpanded && (
              <div className="flex-1 p-4 overflow-y-auto bg-[#070707] text-xs font-mono">
                {activeConsoleTab === 'Testcase' ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-[#707070]">Enter testcase parameters:</span>
                    <textarea
                      value={customTestcaseInput}
                      onChange={(e) => setCustomTestcaseInput(e.target.value)}
                      placeholder="e.g. nums = [2,7,11,15]\ntarget = 9"
                      spellCheck={false}
                      className="w-full h-24 bg-[#121212] border border-[#2e2e2e] focus:border-[#3e3e3e] focus:outline-none rounded-lg p-3 text-emerald-400 placeholder-[#444444]"
                    />
                    <span className="text-[10px] text-[#555555]">
                      Note: Custom inputs will be fed to the program compiler when clicking "Run".
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {isEvaluating ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#a0a0a0]">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                        <span>Compiling code snippet & grading results...</span>
                      </div>
                    ) : evaluationResult ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#707070]">Status:</span>
                            <span 
                              className={`text-sm font-bold uppercase tracking-wider ${
                                evaluationResult.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-500'
                              }`}
                            >
                              {evaluationResult.status}
                            </span>
                          </div>

                          {evaluationResult.status === 'Accepted' && (
                            <div className="flex items-center gap-3 text-[#a0a0a0] text-[10px]">
                              <span>Runtime: <strong className="text-emerald-400 font-mono">{evaluationResult.runtime}</strong></span>
                              <span>Memory: <strong className="text-emerald-400 font-mono">{evaluationResult.memory}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Compiler error outputs */}
                        {evaluationResult.compileError && (
                          <div className="bg-rose-950/20 border border-rose-900/30 p-3.5 rounded-lg text-rose-300 overflow-x-auto text-[11px] leading-relaxed">
                            <div className="flex items-center gap-2 mb-1 text-rose-400 font-bold">
                              <AlertCircle className="w-4 h-4" />
                              <span>Traceback Compilation Error:</span>
                            </div>
                            <pre>{evaluationResult.compileError}</pre>
                          </div>
                        )}

                        {/* Testcases Outputs */}
                        {evaluationResult.testResults && evaluationResult.testResults.length > 0 && (
                          <div className="flex flex-col gap-3">
                            {evaluationResult.testResults.map((tr, index) => (
                              <div 
                                key={index} 
                                className={`border rounded-lg p-3 ${
                                  tr.passed ? 'border-[#1e1e1e] bg-[#121212]/30' : 'border-rose-900/20 bg-rose-950/5'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-xs text-[#a0a0a0]">Testcase {index + 1}:</span>
                                  <span className={`text-[10px] font-bold ${tr.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {tr.passed ? '✓ PASSED' : '✗ FAILED'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                                  <div className="bg-[#121212] p-2 rounded">
                                    <span className="text-[#707070] block text-[9px] mb-0.5 uppercase font-mono">Input:</span>
                                    <span className="text-[#d0d0d0]">{tr.input}</span>
                                  </div>
                                  <div className="bg-[#121212] p-2 rounded">
                                    <span className="text-[#707070] block text-[9px] mb-0.5 uppercase font-mono">Expected:</span>
                                    <span className="text-emerald-400">{tr.expected}</span>
                                  </div>
                                  <div className="bg-[#121212] p-2 rounded">
                                    <span className="text-[#707070] block text-[9px] mb-0.5 uppercase font-mono">Actual:</span>
                                    <span className={tr.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{tr.actual}</span>
                                  </div>
                                </div>

                                {tr.stdout && (
                                  <div className="mt-2 text-[10px] text-[#707070] border-t border-[#1e1e1e] pt-1 font-mono">
                                    <span className="text-[#555] block">stdout:</span>
                                    {tr.stdout}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-[#555555]">
                        Compile & Execute your script using "Run" or "Submit".
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer Action Toolbar */}
            <div className="border-t border-[#1e1e1e] bg-[#0c0c0c] px-4 py-2 flex items-center justify-between text-xs h-12">
              <button 
                onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
                className="flex items-center gap-1.5 text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors"
              >
                <span>Console</span>
                {isTerminalExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEvaluate('run')}
                  disabled={isEvaluating}
                  className="flex items-center gap-1.5 bg-[#1e1e1e] hover:bg-[#2e2e2e] active:bg-[#121212] transition-colors text-[#f5f5f5] px-4 py-2 rounded-lg font-mono font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-[#f5f5f5]" />
                  <span>Run</span>
                </button>

                <button 
                  onClick={() => handleEvaluate('submit')}
                  disabled={isEvaluating}
                  className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition-colors text-black px-5 py-2 rounded-lg font-mono font-bold cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  <span>Submit</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
