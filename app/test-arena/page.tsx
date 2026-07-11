'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { Terminal, Clock, Award, CheckCircle, ArrowRight, Play, Check, AlertCircle } from 'lucide-react';
import { useGameState } from '@/src/lib/gameState';
import Link from 'next/link';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import Badge from '@/src/components/ui/Badge';

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
  { id: 'meta-hack', title: 'Meta Hacker Cup Round 1', date: 'July 18, 2026', duration: '120 mins', questions: 4 },
  { id: 'amazon-sde', title: 'Amazon OA Simulation Prep', date: 'July 24, 2026', duration: '90 mins', questions: 2 },
  { id: 'netflix-sys', title: 'Netflix Systems Architecture OA', date: 'Aug 02, 2026', duration: '60 mins', questions: 1 }
];

export default function TestArenaPage() {
  const { solvedIds } = useGameState();
  const [activeTest, setActiveTest] = useState<TestData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTest && !testSubmitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTest, testSubmitted, timeRemaining]);

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
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans">
        
        {/* Header Title block */}
        {!activeTest && (
          <>
            <Card className="flex flex-col gap-2 relative overflow-hidden select-none">
              <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider">Evaluation Hub</span>
              <h1 className="text-lg font-bold tracking-tight text-text-main">
                Student Test Arena
              </h1>
              <p className="text-xs text-text-muted leading-relaxed font-semibold">
                Prepare for technical coding assessments. Complete active tests, solve target problems, and verify your analytical score dynamically.
              </p>
            </Card>

            {/* Active Assessments list */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card/50 pb-2">
                Active Assessments
              </h2>
              <div className="flex flex-col gap-3">
                {ACTIVE_TESTS.map((test) => (
                  <Card 
                    key={test.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <h3 className="text-sm font-bold text-text-main leading-snug truncate">
                        {test.title}
                      </h3>
                      <p className="text-xs text-text-muted leading-relaxed font-semibold line-clamp-2">
                        {test.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mt-2 font-mono text-[9px] text-text-muted font-bold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-text-muted" /> {test.durationMins} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-text-muted" /> {test.maxPoints} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5 text-text-muted" /> {test.questions.length} problems
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartTest(test)}
                      className="flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Start Test</span>
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming Assessments */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card/50 pb-2">
                Upcoming Assessments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {UPCOMING_TESTS.map((test) => (
                  <Card key={test.id} className="flex flex-col gap-2 leading-snug">
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="text-xs font-bold text-text-main truncate">{test.title}</h3>
                      <Badge variant="medium">{test.date}</Badge>
                    </div>
                    <div className="flex gap-3 mt-1.5 text-[9px] font-mono text-text-muted font-bold">
                      <span>Duration: {test.duration}</span>
                      <span>Questions: {test.questions} challenges</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Assessment Terminal (Active Test Mode) */}
        {activeTest && !testSubmitted && (
          <Card className="flex flex-col gap-5">
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-card/50 pb-3">
              <div className="flex flex-col gap-0.5 leading-snug">
                <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">Assessment Terminal</span>
                <h2 className="text-base font-bold text-text-main">{activeTest.title}</h2>
              </div>

              {/* Countdown ticking display */}
              <div className="flex items-center gap-2 text-red-500 font-mono text-sm font-bold border border-red-500/20 bg-red-500/5 px-3.5 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-red-500" />
                <span>{formatTime(timeRemaining)} remaining</span>
              </div>
            </div>

            {/* Test instructions */}
            <div className="flex gap-2.5 bg-hover/40 border border-border-card/45 p-3.5 rounded-lg items-start text-[11px] leading-relaxed text-text-muted font-semibold">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>
                Please open the challenges below to write and compile your solutions. Once your challenges are marked as <span className="text-primary font-bold">Solved</span> inside the editor dashboard, click <strong>Submit Assessment</strong> in this window to grade your submissions. Do not refresh this window during the test.
              </p>
            </div>

            {/* Test questions check list */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">Assigned Problems</span>
              <div className="flex flex-col gap-2.5">
                {activeTest.questions.map((q, idx) => {
                  const isSolved = solvedIds.includes(q.id);
                  return (
                    <div 
                      key={q.id}
                      className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                        isSolved 
                          ? 'bg-primary/5 border-primary/20 text-text-main' 
                          : 'bg-bg-card border-border-card text-text-muted hover:border-border-card/85'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5.5 h-5.5 rounded font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                          isSolved ? 'bg-primary border-primary text-white' : 'bg-hover border-border-card/65'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-xs font-bold text-text-main">{q.title}</span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-text-muted font-semibold">{q.points} pts</span>
                        {isSolved ? (
                          <span className="flex items-center gap-1 text-primary font-bold">
                            <Check className="w-3.5 h-3.5" /> Solved
                          </span>
                        ) : (
                          <Link 
                            href={`/problems/${q.id}`} 
                            target="_blank"
                            className="bg-bg-card border border-border-card hover:border-primary/50 text-text-main hover:text-primary transition-all px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 hover:bg-hover"
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
            <div className="flex justify-between items-center border-t border-border-card/50 pt-4 mt-1">
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to exit the assessment? Your time progress will be discarded.")) {
                    setActiveTest(null);
                  }
                }}
              >
                Exit Assessment
              </Button>

              <Button 
                variant="primary"
                size="sm"
                onClick={handleSubmitTest}
              >
                Submit Assessment
              </Button>
            </div>

          </Card>
        )}

        {/* Assessment Result Summary */}
        {activeTest && testSubmitted && testResult && (
          <Card className="flex flex-col items-center text-center gap-5 select-none">
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
              testResult.passed ? 'bg-primary/10 border-primary text-primary' : 'bg-red-500/10 border-red-500 text-red-500'
            }`}>
              <Check className="w-6 h-6" />
            </div>

            <div className="flex flex-col gap-1 leading-snug">
              <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">Assessment Results</span>
              <h2 className="text-base font-bold text-text-main">
                {testResult.passed ? 'Assessment Completed!' : 'Assessment Terminated'}
              </h2>
              <p className="text-[11px] text-text-muted leading-relaxed font-semibold max-w-sm mt-0.5">
                Your code solutions have been verified. Refer to the dashboard score distribution details.
              </p>
            </div>

            {/* Score Grid block */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs font-mono text-[10px] border border-border-card/50 bg-bg-base/35 p-4 rounded-lg mt-1">
              <div className="flex flex-col gap-0.5 items-center border-r border-border-card/50">
                <span className="text-text-muted font-bold">TOTAL SCORE</span>
                <span className="text-base font-bold text-text-main">{testResult.score} / {activeTest.maxPoints}</span>
              </div>
              <div className="flex flex-col gap-0.5 items-center">
                <span className="text-text-muted font-bold">GRADE STATUS</span>
                <span className={`text-base font-bold ${testResult.passed ? 'text-primary' : 'text-red-500'}`}>
                  {testResult.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>

            {/* Dynamic Results checklist */}
            <div className="w-full max-w-xs text-left flex flex-col gap-2 mt-2 border-t border-border-card/50 pt-4">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">Detailed Verification</span>
              <div className="flex flex-col gap-2">
                {activeTest.questions.map((q) => {
                  const isSolved = solvedIds.includes(q.id);
                  return (
                    <div key={q.id} className="flex justify-between items-center text-[11px] font-semibold">
                      <span className="text-text-main truncate max-w-[200px]">{q.title}</span>
                      <span className={`font-mono font-bold ${isSolved ? 'text-primary' : 'text-red-500'}`}>
                        {isSolved ? `+${q.points} pts` : '0 pts'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveTest(null)}
              className="w-full max-w-xs mt-3"
            >
              Back to Test Arena
            </Button>

          </Card>
        )}

      </div>
    </AppLayout>
  );
}
