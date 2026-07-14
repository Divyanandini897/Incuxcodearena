'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Play, MessageSquare, Award, Brain, Star, ArrowRight, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import AppLayout from '@/src/components/AppLayout';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Badge from '@/src/components/ui/Badge';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface InterviewResult {
  score: number;
  grammar: number;
  correctness: number;
  feedback: string;
  points: string[];
}

export default function AiInterviewPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  
  // Selection States
  const [role, setRole] = useState('Frontend Developer');
  const [difficulty, setDifficulty] = useState('Senior');
  const [type, setType] = useState('System Design');

  // Conversation States
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userResponse, setUserResponse] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [evalResult, setEvalResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sampleQuestions = {
    'Frontend Developer': [
      'How would you optimize the loading performance of a large React application with extensive component trees and bundle sizes?',
      'Can you explain the event loop in JavaScript, specifically distinguishing between microtasks and macrotasks?'
    ],
    'Backend Developer': [
      'Explain how you would design a high-throughput read cache for an e-commerce platform that experiences sudden flash sales.',
      'How do you manage database connection pooling in a serverless microservice architecture to prevent socket exhaustion?'
    ],
    'System Design': [
      'Design a global rate limiter for an API endpoint. What database or storage layer would you use, and why?',
      'Explain how you would structure data in Redis and PostgreSQL to support a real-time multiplayer gaming leaderboard.'
    ]
  };

  const startInterview = () => {
    setSessionActive(true);
    setEvalResult(null);
    setCurrentStep(0);
    setIsAiTyping(true);

    const questionsList = sampleQuestions[role as keyof typeof sampleQuestions] || sampleQuestions['System Design'];

    setTimeout(() => {
      setMessages([
        {
          sender: 'ai',
          text: `Hello! Welcome to your ${difficulty} ${role} mock interview. I will be evaluating your technical depth, logic, and systems expertise. Let's start with the first topic: \n\n"${questionsList[0]}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAiTyping(false);
    }, 1200);
  };

  const handleSendResponse = () => {
    if (!userResponse.trim()) return;

    const newMessages = [
      ...messages,
      {
        sender: 'user' as const,
        text: userResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);
    const lastAnswer = userResponse;
    setUserResponse('');
    setIsAiTyping(true);

    // Simulate AI grading evaluation
    setTimeout(() => {
      setIsAiTyping(false);
      
      const mockedFeedback: InterviewResult = {
        score: Math.floor(75 + Math.random() * 20),
        grammar: Math.floor(80 + Math.random() * 18),
        correctness: Math.floor(70 + Math.random() * 25),
        feedback: lastAnswer.length > 50 
          ? "Excellent communication. You highlighted key architectural considerations (like horizontal scaling and network latencies), but could add detail regarding replication protocols."
          : "Your answer touches on correct core principles, but feels slightly brief. Expand on edge cases such as network partitioning or transaction concurrency locks.",
        points: lastAnswer.length > 50
          ? ["Properly identifies caching constraints", "Addresses high-throughput replication bottlenecks", "Suggests Redis sentinel / clustering configurations"]
          : ["Mentions database indexes", "Lacks distributed scale insights", "Needs structured database lock explanations"]
      };

      setEvalResult(mockedFeedback);
      
      const questionsList = sampleQuestions[role as keyof typeof sampleQuestions] || sampleQuestions['System Design'];
      
      if (currentStep < questionsList.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Grading completed for Question ${nextStep}. Let's move to Question ${nextStep + 1}:\n\n"${questionsList[nextStep]}"`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: "Congratulations! You have completed all questions in this session. Review your final interview scorecard performance report on the right.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 1800);
  };

  const resetInterview = () => {
    setSessionActive(false);
    setMessages([]);
    setEvalResult(null);
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
        
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> AI Engine v2.0
            </span>
            <h1 className="text-2xl font-black text-text-main tracking-tight">AI Interview Prep</h1>
            <p className="text-xs text-text-muted font-semibold">Simulate real-world technical and system design interviews with real-time feedback and grading scorecards.</p>
          </div>
          {sessionActive && (
            <Button variant="secondary" size="sm" onClick={resetInterview} className="flex items-center gap-1.5 cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /> Reset Session
            </Button>
          )}
        </div>

        {!sessionActive ? (
          /* Configure Panel */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-bg-card border border-border-card rounded-xl p-6 flex flex-col gap-6 shadow-xs">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-text-main border-b border-border-card/45 pb-2">
                Configure Interview Session
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-muted">Target Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-bg-base border border-border-card rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option>Frontend Developer</option>
                    <option>Backend Developer</option>
                    <option>AI/ML Engineer</option>
                    <option>Systems Architect</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-muted">Experience Level</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-bg-base border border-border-card rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option>Junior</option>
                    <option>Mid-Level</option>
                    <option>Senior</option>
                    <option>Principal</option>
                  </select>
                </div>

                {/* Interview Type */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-text-muted">Interview Focus</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="bg-bg-base border border-border-card rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option>System Design</option>
                    <option>Coding & Core Algorithms</option>
                    <option>Behavioral & Leadership</option>
                  </select>
                </div>
              </div>

              <Button variant="primary" size="md" onClick={startInterview} className="mt-4 flex items-center justify-center gap-2 cursor-pointer w-full">
                <Play className="w-4 h-4 fill-white" /> Start AI Mock Session
              </Button>
            </div>

            {/* Quick tips panel */}
            <div className="bg-bg-card border border-border-card rounded-xl p-5 flex flex-col gap-4 shadow-xs">
              <h3 className="text-xs font-black uppercase font-mono tracking-wider text-text-main flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" /> Interview Guidelines
              </h3>
              <ul className="text-xs text-text-muted flex flex-col gap-3 font-semibold">
                <li className="flex gap-2">
                  <span className="text-primary font-mono font-bold">1.</span>
                  <span>Be detailed. Include system models, network assumptions, and tradeoffs.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-mono font-bold">2.</span>
                  <span>AI tracks conceptual correctness, terminology syntax, and clarity.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-mono font-bold">3.</span>
                  <span>Scores above 85 highlight senior-level structural reasoning.</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Active Session Panel */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Chat console */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-bg-card border border-border-card rounded-xl p-4 flex flex-col gap-4 h-[400px] overflow-y-auto custom-scrollbar shadow-xs">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      m.sender === 'user' ? 'self-end flex-row-reverse text-right' : 'self-start'
                    }`}
                  >
                    {m.sender === 'ai' ? (
                      <div className="w-8 h-8 rounded-full bg-hover flex items-center justify-center border border-border-card shrink-0 select-none">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 text-xs font-bold select-none">
                        🧑‍💻
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <div className={`p-3 rounded-xl text-xs leading-relaxed font-medium ${
                        m.sender === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-hover/60 border border-border-card/45 text-text-main rounded-tl-none whitespace-pre-line'
                      }`}>
                        {m.text}
                      </div>
                      <span className="text-[9px] text-text-muted font-mono">{m.timestamp}</span>
                    </div>
                  </div>
                ))}
                
                {isAiTyping && (
                  <div className="flex items-center gap-2.5 self-start">
                    <div className="w-8 h-8 rounded-full bg-hover flex items-center justify-center border border-border-card shrink-0 animate-pulse">
                      <Bot className="w-4 h-4 text-primary animate-bounce" />
                    </div>
                    <div className="bg-hover/40 border border-border-card/30 p-3.5 rounded-xl rounded-tl-none flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Text input area */}
              <div className="bg-bg-card border border-border-card rounded-xl p-3 flex flex-col gap-2.5 shadow-xs">
                <textarea
                  disabled={isAiTyping}
                  placeholder="Type your response here. Explain clearly with architectural considerations..."
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  className="w-full min-h-[90px] bg-bg-base/40 border border-border-card/65 rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-primary/45 resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-text-muted font-mono">Shift+Enter for newline</span>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    disabled={!userResponse.trim() || isAiTyping} 
                    onClick={handleSendResponse}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Submit Answer</span> <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Real-time Evaluation Grade Card */}
            <div className="flex flex-col gap-4">
              <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-5 justify-between h-full">
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-text-main border-b border-border-card/45 pb-2 flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-primary" /> Evaluation Report
                  </h3>
                  
                  {evalResult ? (
                    <div className="flex flex-col gap-5 mt-4">
                      {/* Circle score indicator */}
                      <div className="flex items-center justify-around gap-2 bg-hover/20 p-4 rounded-xl border border-border-card/50">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-black font-mono text-primary">{evalResult.score}</span>
                          <span className="text-[10px] text-text-muted font-bold">Overall Score</span>
                        </div>
                        <div className="h-8 w-px bg-border-card" />
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold font-mono text-text-main">{evalResult.correctness}%</span>
                          <span className="text-[9px] text-text-muted font-semibold">Technical</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold font-mono text-text-main">{evalResult.grammar}%</span>
                          <span className="text-[9px] text-text-muted font-semibold">Communication</span>
                        </div>
                      </div>

                      {/* Feedback Text */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-text-muted flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> AI Feedback</span>
                        <p className="text-[11px] text-text-muted leading-relaxed font-semibold">{evalResult.feedback}</p>
                      </div>

                      {/* Bullet Key Points */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-text-muted">Analyzed Rubrics</span>
                        <div className="flex flex-col gap-1.5">
                          {evalResult.points.map((p, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] font-semibold text-text-main">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted gap-2.5">
                      <MessageSquare className="w-8 h-8 opacity-45" />
                      <p className="text-xs font-semibold">Submit your first answer to generate real-time evaluations.</p>
                    </div>
                  )}
                </div>

                <div className="text-[9px] text-text-muted font-mono font-bold border-t border-border-card/40 pt-3">
                  System tracks micro and macro parameters
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </AppLayout>
  );
}
