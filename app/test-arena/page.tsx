'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navigation from '@/src/components/Navigation';
import { Terminal, Clock, Award, CheckCircle, ArrowRight, Play, Check, AlertCircle } from 'lucide-react';
import { useGameState } from '@/src/lib/gameState';
import Link from 'next/link';

interface TestQuestion {
  id: number;
  title: string;
  points: number;
}

interface TestData {
  id: string;
  title: string;
  description: string;
  durationMins: number;
  maxPoints: number;
  questions: TestQuestion[];
}

const ACTIVE_TESTS: TestData[] = [
  {
    id: 'google-mock',
    title: 'Google Assessment Mock',
    description: 'Evaluate candidate algorithm proficiency. Solve array aggregations and string validations under time limits.',
    durationMins: 60,
    maxPoints: 200,
    questions: [
      { id: 1, title: 'Two Sum', points: 100 },
      { id: 20, title: 'Valid Parentheses', points: 100 }
    ]
  },
  {
    id: 'deloitte-sql',
    title: 'Deloitte SQL Prep Assessment',
    description: 'Practice database join operations, CTE lookups, and window aggregations.',
    durationMins: 45,
    maxPoints: 100,
    questions: [
      { id: 175, title: 'Combine Two Tables', points: 100 }
    ]
  },
  {
    id: 'weekly-contest',
    title: 'Weekly Coding Contest 405',
    description: 'Compete on algorithmic complexity, dynamic programming, and array partitions.',
    durationMins: 90,
    maxPoints: 300,
    questions: [
      { id: 3, title: 'Longest Substring Without Repeating Characters', points: 150 },
      { id: 11, title: 'Container With Most Water', points: 150 }
    ]
  }
];

const UPCOMING_TESTS = [
  { id: 'up-1', title: 'Data Structures Midterm', date: 'In 2 days', duration: '50 mins', questions: 10 },
  { id: 'up-2', title: 'Amazon Mock Evaluation', date: 'In 5 days', duration: '90 mins', questions: 3 }
];

export default function TestArenaPage() {
  const { solvedIds } = useGameState();
  const [activeTest, setActiveTest] = useState<TestData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Timer countdown hook
  useEffect(() => {
    if (!activeTest || timeRemaining <= 0 || testSubmitted) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTest, timeRemaining, testSubmitted]);

  const handleStartTest = (test: TestData) => {
    setActiveTest(test);
    setTimeRemaining(test.durationMins * 60);
    setTestSubmitted(false);
    setTestResult(null);
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;

    let earnedPoints = 0;
    activeTest.questions.forEach((q) => {
      if (solvedIds.includes(q.id)) {
        earnedPoints += q.points;
      }
    });

    const passed = earnedPoints >= (activeTest.maxPoints * 0.5); // 50% pass bound
    setTestResult({ score: earnedPoints, passed });
    setTestSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-main font-sans pb-16">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 mt-8 flex flex-col gap-8">
        
        {/* Header Title block */}
        {!activeTest && (
          <>
            <div className="bg-bg-card border border-border-card rounded-xl p-6 glow-border flex flex-col gap-3 relative overflow-hidden">
              <span className="text-[11px] font-mono font-black uppercase text-primary tracking-wider">Evaluation Hub</span>
              <h1 className="text-2xl font-black tracking-tight text-text-main">
                Student Test Arena
              </h1>
              <p className="text-sm text-text-muted leading-relaxed font-medium max-w-2xl">
                Prepare for technical coding assessments. Complete active tests, solve target problems, and verify your analytical score dynamically.
              </p>
            </div>

            {/* Active Assessments list */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-2.5">
                Active Assessments
              </h2>
              <div className="flex flex-col gap-4">
                {ACTIVE_TESTS.map((test) => (
                  <div 
                    key={test.id}
                    className="bg-bg-card border border-border-card rounded-xl p-6 glow-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:scale-[1.005] transition-transform duration-300"
                  >
                    <div className="flex flex-col gap-2 max-w-xl">
                      <h3 className="text-base font-black text-text-main leading-snug">
                        {test.title}
                      </h3>
                      <p className="text-xs text-text-muted leading-relaxed font-medium">
                        {test.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mt-1.5 font-mono text-[10px] text-text-muted font-bold">
                        <span className="flex items-center gap-1.5 bg-bg-base px-2 py-1 rounded border border-border-card/50">
                          <Clock className="w-3.5 h-3.5" /> {test.durationMins} Mins
                        </span>
                        <span className="flex items-center gap-1.5 bg-bg-base px-2 py-1 rounded border border-border-card/50">
                          <Award className="w-3.5 h-3.5 text-yellow-600" /> {test.maxPoints} Points
                        </span>
                        <span className="flex items-center gap-1.5 bg-bg-base px-2 py-1 rounded border border-border-card/50">
                          <Terminal className="w-3.5 h-3.5 text-primary" /> {test.questions.length} Coding Challenges
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartTest(test)}
                      className="bg-primary text-white text-xs font-mono font-black py-2.5 px-5 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-primary/10 shrink-0 self-end sm:self-center"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Assessment</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Assessments */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-2.5">
                Upcoming Assessments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {UPCOMING_TESTS.map((test) => (
                  <div key={test.id} className="bg-bg-card/65 border border-border-card/55 rounded-xl p-5 flex flex-col gap-2 leading-snug">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-text-main">{test.title}</h3>
                      <span className="text-[10px] font-mono text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/15 uppercase font-bold">
                        {test.date}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-[10px] font-mono text-text-muted font-bold">
                      <span>Duration: {test.duration}</span>
                      <span>Questions: {test.questions} MCQs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Assessment Terminal (Active Test Mode) */}
        {activeTest && !testSubmitted && (
          <div className="bg-bg-card border border-border-card rounded-xl p-6 glow-border flex flex-col gap-6">
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-card pb-4">
              <div className="flex flex-col gap-1 leading-snug">
                <span className="text-[10px] font-mono font-black text-primary uppercase tracking-wider">Assessment Terminal</span>
                <h2 className="text-lg font-black text-text-main">{activeTest.title}</h2>
              </div>

              {/* Countdown ticking display */}
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-base font-black px-4 py-2 rounded-lg shadow-sm animate-pulse">
                <Clock className="w-5 h-5 text-red-500" />
                <span>{formatTime(timeRemaining)} Remaining</span>
              </div>
            </div>

            {/* Test instructions */}
            <div className="flex gap-3.5 bg-bg-base/40 border border-border-card/60 p-4 rounded-lg items-start text-xs font-medium leading-relaxed text-text-muted">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p>
                Please open the challenges below to write and compile your solutions. Once your challenges are marked as <span className="text-primary font-bold">Solved</span> inside the editor dashboard, click <strong>Submit Assessment</strong> in this window to grade your submissions. Do not refresh this window during the test.
              </p>
            </div>

            {/* Test questions check list */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Assigned Problems</span>
              <div className="flex flex-col gap-3">
                {activeTest.questions.map((q, idx) => {
                  const isSolved = solvedIds.includes(q.id);
                  return (
                    <div 
                      key={q.id}
                      className={`flex justify-between items-center p-4 rounded-lg border transition-colors ${
                        isSolved 
                          ? 'bg-primary/5 border-primary/20 text-text-main' 
                          : 'bg-bg-base/50 border-border-card text-text-muted hover:border-border-card/85'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 border ${
                          isSolved ? 'bg-primary border-primary text-white' : 'bg-neutral-800 border-border-card'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-text-main">{q.title}</span>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-xs">
                        <span className="text-text-muted font-bold">{q.points} pts</span>
                        {isSolved ? (
                          <span className="flex items-center gap-1.5 text-primary font-bold">
                            <CheckCircle className="w-4.5 h-4.5 text-primary" /> Completed
                          </span>
                        ) : (
                          <Link 
                            href={`/problems/${q.id}`} 
                            target="_blank"
                            className="bg-neutral-800 border border-border-card hover:border-primary/50 text-text-main hover:text-primary transition-all px-3 py-1 rounded font-bold cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Solve</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex justify-between items-center border-t border-border-card/65 pt-5 mt-2">
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to exit the assessment? Your time progress will be discarded.")) {
                    setActiveTest(null);
                  }
                }}
                className="text-text-muted hover:text-text-main border border-border-card/80 hover:border-border-card bg-transparent text-xs font-mono font-black py-2.5 px-4 rounded-lg cursor-pointer transition-colors"
              >
                Exit Assessment
              </button>

              <button 
                onClick={handleSubmitTest}
                className="bg-primary text-white text-xs font-mono font-black py-2.5 px-6 rounded-lg hover:bg-primary-hover cursor-pointer transition-all shadow-md shadow-primary/10"
              >
                Submit Assessment
              </button>
            </div>

          </div>
        )}

        {/* Assessment Result Summary */}
        {activeTest && testSubmitted && testResult && (
          <div className="bg-bg-card border border-border-card rounded-xl p-8 glow-border flex flex-col items-center text-center gap-6">
            
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
              testResult.passed ? 'bg-primary/10 border-primary text-primary' : 'bg-red-500/10 border-red-500 text-red-500'
            }`}>
              <Check className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-black text-primary uppercase tracking-wider">Assessment Results</span>
              <h2 className="text-2xl font-black text-text-main">
                {testResult.passed ? 'Assessment Completed!' : 'Assessment Terminated'}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed font-semibold max-w-md mt-1">
                Your code solutions have been verified. Refer to the dashboard score distribution details.
              </p>
            </div>

            {/* Score Grid block */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm font-mono text-xs border border-border-card/60 bg-bg-base/35 p-5 rounded-xl mt-2">
              <div className="flex flex-col gap-1 items-center border-r border-border-card/65">
                <span className="text-text-muted font-bold">TOTAL SCORE</span>
                <span className="text-xl font-black text-text-main">{testResult.score} / {activeTest.maxPoints}</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <span className="text-text-muted font-bold">GRADE STATUS</span>
                <span className={`text-xl font-black ${testResult.passed ? 'text-primary' : 'text-red-500'}`}>
                  {testResult.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>

            {/* Dynamic Results checklist */}
            <div className="w-full max-w-md text-left flex flex-col gap-3 mt-2 border-t border-border-card/65 pt-6">
              <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Detailed Verification</span>
              <div className="flex flex-col gap-2.5">
                {activeTest.questions.map((q) => {
                  const isSolved = solvedIds.includes(q.id);
                  return (
                    <div key={q.id} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-text-main">{q.title}</span>
                      <span className={`font-mono font-bold ${isSolved ? 'text-primary' : 'text-red-500'}`}>
                        {isSolved ? `+${q.points} Points` : '0 Points'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setActiveTest(null)}
              className="w-full max-w-xs bg-primary text-white text-xs font-mono font-black py-2.5 rounded-lg hover:bg-primary-hover transition-colors cursor-pointer text-center mt-4 shadow-md shadow-primary/10"
            >
              Back to Test Arena
            </button>

          </div>
        )}

      </main>
    </div>
  );
}
