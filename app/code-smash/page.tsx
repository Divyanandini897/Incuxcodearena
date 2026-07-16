'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { useGameState } from '@/src/lib/gameState';
import { 
  Swords, 
  Trophy, 
  Zap, 
  Clock, 
  Sparkles, 
  User, 
  Users2, 
  Gamepad2, 
  CheckCircle2, 
  ArrowLeft, 
  Copy, 
  AlertCircle,
  Code2,
  Play,
  RotateCcw,
  Volume2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '@/src/components/ui/Button';
import Badge from '@/src/components/ui/Badge';

export default function CodeSmashPage() {
  const { userName, level } = useGameState();
  const [view, setView] = useState<'landing' | 'lobby' | 'countdown' | 'match' | 'result'>('landing');
  const [selectedMode, setSelectedMode] = useState<'code' | 'quiz' | 'debug'>('code');
  const [roomId, setRoomId] = useState('');
  
  // Lobby States
  const [isReadySelf, setIsReadySelf] = useState(false);
  const [isReadyOpponent, setIsReadyOpponent] = useState(false);
  const [opponentName, setOpponentName] = useState('NexusCoder');
  const [opponentLvl, setOpponentLvl] = useState(8);
  const [opponentPing, setOpponentPing] = useState(32);
  const [pingSelf, setPingSelf] = useState(24);
  const [countdown, setCountdown] = useState(3);
  
  // Match States
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [opponentStatus, setOpponentStatus] = useState('Writing code...');
  const [opponentScore, setOpponentScore] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  
  // Mode 1 (Code Battle) state
  const [userCode, setUserCode] = useState(
`function reverseWords(s) {
  // Write your competitive code here...
  
}`
  );
  
  // Mode 2 (Quiz Battle) state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizLockout, setQuizLockout] = useState(false);
  const [quizScoreSelf, setQuizScoreSelf] = useState(0);
  const [quizScoreOpponent, setQuizScoreOpponent] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const quizQuestions = [
    {
      q: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
      correct: 1
    },
    {
      q: 'What is the worst-case time complexity of Quick Sort?',
      options: ['O(N log N)', 'O(N)', 'O(N²)', 'O(2^N)'],
      correct: 2
    },
    {
      q: 'Which database indexing mechanism uses balanced multi-way tree structures?',
      options: ['Hash Index', 'B-Tree Index', 'Bitmap Index', 'Inverted Index'],
      correct: 1
    },
    {
      q: 'What is the time complexity of searching a key in a balanced Binary Search Tree?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correct: 1
    },
    {
      q: 'What does TCP stand for in networking standards?',
      options: ['Transmission Control Protocol', 'Telecommunication Connection Path', 'Transfer Command Protocol', 'Technical Communication Packet'],
      correct: 0
    }
  ];

  // Mode 3 (Debug Battle) state
  const [debugCode, setDebugCode] = useState(
`// Fix the bug! This function fails when the input array contains only negative numbers.
function findMax(arr) {
  let max = 0; 
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`
  );
  const [debugSubmitted, setDebugSubmitted] = useState(false);

  // Result States
  const [ratingChange, setRatingChange] = useState(24);
  const [xpEarned, setXpEarned] = useState(75);
  const [winner, setWinner] = useState('');
  const [execTime, setExecTime] = useState('18ms');
  const [memUsage, setMemUsage] = useState('14.2MB');
  const [subTime, setSubTime] = useState('2m 14s');

  // Trigger room code generation
  const handleStartLobby = (mode: 'code' | 'quiz' | 'debug') => {
    setSelectedMode(mode);
    const randId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomId(randId);
    setIsReadySelf(false);
    setIsReadyOpponent(false);
    setView('lobby');
    
    // Auto-ready simulated opponent after 4 seconds
    setTimeout(() => {
      setIsReadyOpponent(true);
    }, 4500);
  };

  // Simulated ready trigger
  const handleToggleReady = () => {
    setIsReadySelf(prev => !prev);
  };

  // Launch countdown when both players are ready
  useEffect(() => {
    if (isReadySelf && isReadyOpponent && view === 'lobby') {
      setView('countdown');
      setCountdown(3);
    }
  }, [isReadySelf, isReadyOpponent, view]);

  // Countdown clock loop
  useEffect(() => {
    if (view === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Initialize match states depending on mode
            if (selectedMode === 'code') setTimer(600);
            else if (selectedMode === 'quiz') {
              setTimer(90);
              setCurrentQuizIndex(0);
              setQuizScoreSelf(0);
              setQuizScoreOpponent(0);
              setQuizFinished(false);
            } else setTimer(300);
            setView('match');
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [view, selectedMode]);

  // Simulated opponent behavior during gameplay
  useEffect(() => {
    if (view === 'match') {
      const opponentTimer = setInterval(() => {
        // Ticks down the clock
        setTimer(prev => (prev > 0 ? prev - 1 : 0));

        // Random simulated statuses
        if (selectedMode === 'code') {
          const statuses = ['Writing helper classes...', 'Running local tests...', 'Compiling solution...', 'Submitted (Evaluating)...'];
          const rand = Math.floor(Math.random() * 80);
          if (rand < 4) {
            setOpponentStatus(statuses[rand]);
          }
          if (timer === 550) {
            setOpponentStatus('Submitted (Correct!)');
          }
        } else if (selectedMode === 'quiz') {
          // Opponent randomly scores points over time
          const rand = Math.random();
          if (rand < 0.08 && quizScoreOpponent < quizQuestions.length) {
            setQuizScoreOpponent(prev => prev + 1);
          }
        } else if (selectedMode === 'debug') {
          const rand = Math.random();
          if (rand < 0.05 && opponentScore < 1) {
            setOpponentScore(1);
            setOpponentStatus('Opponent fixed bug 1!');
          }
        }
      }, 1000);

      return () => clearInterval(opponentTimer);
    }
  }, [view, selectedMode, timer, quizScoreOpponent, opponentScore]);

  // MCQ Selection handler
  const handleSelectQuizOption = (index: number) => {
    if (quizLockout || quizFinished) return;
    const currentQ = quizQuestions[currentQuizIndex];
    if (index === currentQ.correct) {
      setQuizScoreSelf(prev => prev + 1);
      advanceQuiz();
    } else {
      // Lockout for 2 seconds
      setQuizLockout(true);
      setTimeout(() => {
        setQuizLockout(false);
        advanceQuiz();
      }, 2000);
    }
  };

  const advanceQuiz = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      // Determine winner
      setTimeout(() => {
        const playerFinal = quizScoreSelf;
        const opponentFinal = quizScoreOpponent;
        if (playerFinal > opponentFinal) {
          setWinner(userName || 'Player');
          setMatchResult('victory');
        } else if (opponentFinal > playerFinal) {
          setWinner(opponentName);
          setMatchResult('defeat');
        } else {
          setWinner('Draw');
          setMatchResult('draw');
        }
        setView('result');
      }, 1000);
    }
  };

  const [matchResult, setMatchResult] = useState<'victory' | 'defeat' | 'draw'>('victory');

  // Submit Code Battle handler
  const handleSubmitCodeBattle = () => {
    // Simulating validation results
    setOpponentStatus('Submitted (Correct!)');
    setTimeout(() => {
      // Say we won because we submitted in under 1 minute!
      setWinner(userName || 'Player');
      setMatchResult('victory');
      setSubTime('45s');
      setExecTime('12ms');
      setMemUsage('11.5MB');
      setView('result');
    }, 1500);
  };

  // Submit Debug Battle handler
  const handleSubmitDebugBattle = () => {
    setDebugSubmitted(true);
    setPlayerScore(1);
    setTimeout(() => {
      // Determine winner
      if (playerScore >= opponentScore) {
        setWinner(userName || 'Player');
        setMatchResult('victory');
      } else {
        setWinner(opponentName);
        setMatchResult('defeat');
      }
      setView('result');
    }, 1500);
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-[1200px] mx-auto select-none font-sans pb-16">
        
        <AnimatePresence mode="wait">
          
          {/* View 1: LANDING PAGE */}
          {view === 'landing' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-12 text-left"
            >
              
              {/* Hero Banner Grid */}
              <div className="relative overflow-hidden rounded-2xl border border-border-card/30 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg min-h-[360px] group cursor-default">
                
                {/* Generated Neon coding duel background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src="/code_smash_hero.png" 
                    alt="Code Smash Backdrop" 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out select-none pointer-events-none opacity-60 brightness-110 contrast-110"
                  />
                  <div className="absolute inset-0 bg-black/45" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.35)_100%)] mix-blend-multiply" />
                </div>

                {/* Left Text Detail */}
                <div className="flex flex-col gap-4 relative z-10 text-white max-w-lg">
                  <span className="text-[10px] font-black font-mono uppercase tracking-wider text-primary bg-primary/20 border border-primary/35 px-2.5 py-1 rounded-full w-max flex items-center gap-1.5 shadow-sm">
                    <Swords className="w-3.5 h-3.5 fill-primary" /> REAL-TIME BATTLE ARENA
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
                    Code <span className="text-primary font-black">Smash</span>
                  </h1>
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium mt-1">
                    Face off against programmers globally in synchronous coding sprints, rapid quiz counters, and logical debugging tournaments. Play modes, climb the rankings, and dominate the Arena.
                  </p>
                  
                  <div className="flex gap-3.5 mt-4">
                    <Button 
                      variant="primary" 
                      onClick={() => handleStartLobby('code')}
                      className="flex items-center gap-1.5 cursor-pointer bg-primary hover:bg-primary/95 text-white border-0 shadow-md py-2 px-5 text-xs font-bold"
                    >
                      <Gamepad2 className="w-4 h-4 fill-white" /> Quick Match
                    </Button>
                    <Badge variant="hard" className="py-2.5 px-3 bg-black/45 text-[10px] font-mono border-white/10 text-white backdrop-blur-md">
                      3,428 Players Online
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Game Modes Row */}
              <div className="flex flex-col gap-6">
                <h2 className="text-xs font-black uppercase font-mono tracking-wider text-text-main border-b border-border-card/65 pb-2">Select Game Mode</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Mode 1 */}
                  <div className="bg-bg-card border border-border-card rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <Code2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-black text-text-main group-hover:text-primary transition-colors">Code Battle</h3>
                          <Badge variant="medium">Medium</Badge>
                        </div>
                        <p className="text-[11.5px] text-text-muted leading-relaxed font-semibold mt-1">
                          Solve the same algorithmic challenge simultaneously. Speed, accuracy, and complexity dictate the scoring outcome.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border-card/45 pt-4 mt-2">
                      <span className="text-[10px] text-text-muted font-mono font-bold">20 MINS</span>
                      <Button variant="primary" size="sm" onClick={() => handleStartLobby('code')} className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer">
                        Battle <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Mode 2 */}
                  <div className="bg-bg-card border border-border-card rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <Zap className="w-6 h-6 text-orange-500 fill-orange-500/10" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-black text-text-main group-hover:text-orange-500 transition-colors">Quiz Battle</h3>
                          <Badge variant="easy">Easy</Badge>
                        </div>
                        <p className="text-[11.5px] text-text-muted leading-relaxed font-semibold mt-1">
                          Rapid-fire technical MCQs. First correct answer gets points. Incorrect locks selection for 2 seconds.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border-card/45 pt-4 mt-2">
                      <span className="text-[10px] text-text-muted font-mono font-bold">10 MINS</span>
                      <Button variant="secondary" size="sm" onClick={() => handleStartLobby('quiz')} className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer">
                        Battle <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Mode 3 */}
                  <div className="bg-bg-card border border-border-card rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-black text-text-main group-hover:text-red-500 transition-colors">Debug Battle</h3>
                          <Badge variant="hard">Hard</Badge>
                        </div>
                        <p className="text-[11.5px] text-text-muted leading-relaxed font-semibold mt-1">
                          Receive buggy codes. Find syntax errors, logical oversights, and testcase fails faster than the opponent.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border-card/45 pt-4 mt-2">
                      <span className="text-[10px] text-text-muted font-mono font-bold">15 MINS</span>
                      <Button variant="secondary" size="sm" onClick={() => handleStartLobby('debug')} className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer">
                        Battle <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Placeholders for Future Features */}
              <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-xs font-black uppercase font-mono tracking-wider text-text-main border-b border-border-card/65 pb-2">Arena Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Ranked Matches', detail: 'Climb leagues' },
                    { label: 'Private Match', detail: 'Duel friends' },
                    { label: 'Tournament Cups', detail: 'Global bracket' },
                    { label: 'Spectator Mode', detail: 'Watch battles' }
                  ].map((feat, idx) => (
                    <div key={idx} className="bg-bg-card/40 border border-border-card/30 rounded-xl p-4 text-center cursor-default hover:border-primary/10 transition-colors opacity-75">
                      <span className="text-xs font-bold text-text-main">{feat.label}</span>
                      <p className="text-[9.5px] text-text-muted font-mono font-bold mt-1 uppercase">{feat.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* View 2: WAITING LOBBY */}
          {view === 'lobby' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto bg-bg-card border border-border-card rounded-2xl p-6 md:p-8 shadow-lg flex flex-col gap-8 text-left relative"
            >
              <button 
                onClick={() => setView('landing')}
                className="absolute top-6 left-6 text-text-muted hover:text-text-main text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="flex flex-col gap-1 items-center text-center mt-6">
                <span className="text-[10px] font-bold font-mono text-primary uppercase tracking-wider">{selectedMode} Arena Lobby</span>
                <h2 className="text-2xl font-black text-text-main tracking-tight">Synchronous Waiting Room</h2>
                <div className="flex items-center gap-2 mt-2 py-1 px-3 bg-hover rounded-lg border border-border-card/65 font-mono text-xs font-bold text-text-main">
                  <span>ROOM: {roomId}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(roomId)}
                    className="p-1 hover:bg-bg-card rounded cursor-pointer transition-colors"
                    title="Copy Room ID"
                  >
                    <Copy className="w-3.5 h-3.5 text-text-muted hover:text-primary" />
                  </button>
                </div>
              </div>

              {/* Lobby Players Card Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Self Card */}
                <div className="bg-bg-base/40 border border-border-card rounded-xl p-5 flex flex-col gap-4 items-center justify-between text-center relative overflow-hidden">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-base font-bold text-primary select-none">
                      {(userName || 'You').charAt(0).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <h4 className="text-sm font-black text-text-main">{userName || 'You'}</h4>
                      <span className="text-[9.5px] font-mono font-bold text-text-muted mt-1 uppercase">Level {level}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full items-center">
                    <span className="text-[9px] font-mono font-bold text-emerald-400">Ping: {pingSelf}ms</span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      isReadySelf 
                        ? 'bg-primary/10 text-primary border-primary/30' 
                        : 'bg-hover text-text-muted border-border-card/65'
                    }`}>
                      {isReadySelf ? 'Ready' : 'Not Ready'}
                    </span>
                  </div>
                </div>

                {/* Opponent Card */}
                <div className="bg-bg-base/40 border border-border-card rounded-xl p-5 flex flex-col gap-4 items-center justify-between text-center relative overflow-hidden">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-base font-bold text-orange-500 select-none">
                      {(opponentName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <h4 className="text-sm font-black text-text-main">{opponentName}</h4>
                      <span className="text-[9.5px] font-mono font-bold text-text-muted mt-1 uppercase">Level {opponentLvl}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full items-center">
                    <span className="text-[9px] font-mono font-bold text-emerald-400">Ping: {opponentPing}ms</span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      isReadyOpponent 
                        ? 'bg-primary/10 text-primary border-primary/30' 
                        : 'bg-hover text-text-muted border-border-card/65'
                    }`}>
                      {isReadyOpponent ? 'Ready' : 'Waiting...'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Lobby Action Buttons */}
              <div className="flex flex-col gap-3 mt-2">
                <Button 
                  variant={isReadySelf ? 'secondary' : 'primary'}
                  onClick={handleToggleReady}
                  className="w-full justify-center py-2.5 font-bold cursor-pointer"
                >
                  {isReadySelf ? 'Cancel Ready' : 'Lock Ready State'}
                </Button>
                <div className="text-center text-[10px] text-text-muted font-mono font-bold uppercase mt-1">
                  {!isReadyOpponent ? 'Waiting for opponent to lock in ready status...' : 'Both players connected. Lock ready to start.'}
                </div>
              </div>

            </motion.div>
          )}

          {/* View 3: COUNTDOWN TIMER */}
          {view === 'countdown' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <div className="flex flex-col items-center gap-6">
                <span className="text-xs font-mono font-bold uppercase text-primary tracking-widest animate-pulse">Match Starting</span>
                <h1 className="text-9xl font-black font-mono text-text-main animate-bounce">
                  {countdown}
                </h1>
                <span className="text-sm font-mono font-bold text-text-muted uppercase">Prepare Coding Arena</span>
              </div>
            </motion.div>
          )}

          {/* View 4: LIVE MATCH UI */}
          {view === 'match' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 text-left"
            >
              
              {/* Match Header Panel */}
              <div className="flex items-center justify-between border border-border-card bg-bg-card p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black text-text-main font-mono uppercase tracking-wider">LIVE MATCH</span>
                  </div>
                  <div className="h-4 w-px bg-border-card" />
                  <span className="text-xs font-mono text-text-muted font-bold truncate">ROOM: {roomId}</span>
                </div>

                {/* Match Countdown Clock */}
                <div className="flex items-center gap-2 bg-hover/80 px-4 py-1.5 rounded-lg border border-border-card/65 font-mono text-sm font-bold text-text-main">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{formatTime(timer)}</span>
                </div>

                {/* Connection Ping Indicators */}
                <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
                  <span>Ping: {pingSelf}ms</span>
                </div>
              </div>

              {/* Main Battle gameplay templates depending on selectedMode */}
              
              {/* Mode 1: CODE BATTLE */}
              {selectedMode === 'code' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Left Column: Problem & Editor */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary font-mono uppercase">Problem Details</span>
                        <Badge variant="medium">Medium</Badge>
                      </div>
                      <h2 className="text-base font-black text-text-main">186. Reverse Words in a String</h2>
                      <p className="text-xs text-text-muted leading-relaxed font-semibold">
                        Given an input string `s`, reverse the order of the words.<br/><br/>
                        A word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space.<br/><br/>
                        Return a string of the words in reverse order concatenated by a single space.
                      </p>
                    </div>

                    {/* Code Editor */}
                    <div className="bg-bg-card border border-border-card rounded-xl p-4 flex flex-col gap-4">
                      <div className="flex justify-between items-center text-xs font-mono border-b border-border-card/45 pb-3">
                        <span className="font-bold text-text-muted">JavaScript (NodeJS)</span>
                        <span className="text-primary font-bold">● Active code sync</span>
                      </div>
                      <textarea
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        className="w-full min-h-[220px] bg-bg-base/65 focus:outline-none p-4 rounded-lg font-mono text-xs text-text-main border border-border-card/40 resize-none leading-relaxed"
                      />
                      <div className="flex justify-between items-center border-t border-border-card/40 pt-4">
                        <span className="text-[10px] text-text-muted font-mono font-bold">Auto-save completed</span>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" className="cursor-pointer">Run Tests</Button>
                          <Button variant="primary" size="sm" onClick={handleSubmitCodeBattle} className="cursor-pointer">Submit Solution</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Competitor Panels */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-5 text-left">
                      <h3 className="text-xs font-black uppercase font-mono tracking-wider text-text-main border-b border-border-card/45 pb-2.5">
                        Competitors Progress
                      </h3>
                      
                      {/* Self Status */}
                      <div className="flex flex-col gap-2 p-3 bg-bg-base/20 border border-border-card/30 rounded-xl">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted">
                          <span className="text-text-main">{userName || 'You'}</span>
                          <span>Writing code</span>
                        </div>
                        <div className="w-full h-1 bg-hover rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '40%' }} />
                        </div>
                      </div>

                      {/* Opponent Status */}
                      <div className="flex flex-col gap-2 p-3 bg-bg-base/20 border border-border-card/30 rounded-xl">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted">
                          <span className="text-text-main">{opponentName}</span>
                          <span className="text-primary animate-pulse">{opponentStatus}</span>
                        </div>
                        <div className="w-full h-1 bg-hover rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: opponentStatus.includes('Submitted') ? '100%' : '55%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Test Cases Panel */}
                    <div className="bg-bg-card border border-border-card rounded-xl p-5 flex flex-col gap-3 text-left">
                      <h4 className="text-xs font-mono font-bold text-text-muted uppercase">Pre-run Validation</h4>
                      <div className="flex flex-col gap-2 text-xs font-mono font-bold mt-1">
                        <div className="p-2.5 bg-hover/40 border border-border-card/25 rounded-lg flex items-center justify-between">
                          <span>Case 1: "the sky is blue"</span>
                          <span className="text-primary">Passed</span>
                        </div>
                        <div className="p-2.5 bg-hover/40 border border-border-card/25 rounded-lg flex items-center justify-between">
                          <span>Case 2: "  hello world  "</span>
                          <span className="text-primary">Passed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Mode 2: MCQ QUIZ BATTLE */}
              {selectedMode === 'quiz' && (
                <div className="max-w-2xl mx-auto flex flex-col gap-6 w-full">
                  
                  {/* Live scoreboard */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-bg-card border border-border-card p-4 rounded-xl shadow-xs">
                      <span className="text-[10px] font-mono font-bold text-text-muted uppercase">YOUR SCORE</span>
                      <h3 className="text-3xl font-black font-mono text-primary mt-1">{quizScoreSelf}</h3>
                    </div>
                    <div className="bg-bg-card border border-border-card p-4 rounded-xl shadow-xs">
                      <span className="text-[10px] font-mono font-bold text-text-muted uppercase">{opponentName} SCORE</span>
                      <h3 className="text-3xl font-black font-mono text-orange-500 mt-1">{quizScoreOpponent}</h3>
                    </div>
                  </div>

                  {/* Question box */}
                  <div className="bg-bg-card border border-border-card rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center text-xs font-mono text-text-muted border-b border-border-card/45 pb-3">
                      <span>QUESTION {currentQuizIndex + 1} OF {quizQuestions.length}</span>
                      {quizLockout && <span className="text-red-500 font-bold animate-pulse">Wrong! 2s lockout</span>}
                    </div>

                    <h3 className="text-sm md:text-base font-black text-text-main leading-relaxed">
                      {quizQuestions[currentQuizIndex].q}
                    </h3>

                    <div className="grid grid-cols-1 gap-3.5 mt-2">
                      {quizQuestions[currentQuizIndex].options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={quizLockout}
                          onClick={() => handleSelectQuizOption(i)}
                          className={`w-full text-left p-3.5 rounded-xl border border-border-card bg-bg-base/35 text-xs text-text-main font-bold hover:border-primary/35 hover:bg-hover/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Mode 3: DEBUG BATTLE */}
              {selectedMode === 'debug' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Left Column: Instructions & Code */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-red-500 font-mono uppercase">Logical Bug Detected</span>
                      <h2 className="text-base font-black text-text-main">Locate and Fix the bug</h2>
                      <p className="text-xs text-text-muted leading-relaxed font-semibold">
                        The function `findMax` is intended to scan an array and return its highest value. However, it fails when the array contains only negative integers (returning `0` instead). Fix it to receive duel points.
                      </p>
                    </div>

                    {/* Editor */}
                    <div className="bg-bg-card border border-border-card rounded-xl p-4 flex flex-col gap-4">
                      <textarea
                        value={debugCode}
                        onChange={(e) => setDebugCode(e.target.value)}
                        className="w-full min-h-[220px] bg-bg-base/65 focus:outline-none p-4 rounded-lg font-mono text-xs text-text-main border border-border-card/40 resize-none leading-relaxed"
                      />
                      <div className="flex justify-end gap-2 border-t border-border-card/40 pt-4">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={handleSubmitDebugBattle}
                          className="cursor-pointer"
                        >
                          Submit Debug Fix
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Scoreboard */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4 text-left">
                      <h3 className="text-xs font-black uppercase font-mono tracking-wider text-text-main border-b border-border-card/45 pb-2.5">
                        Live Scoreboard
                      </h3>
                      <div className="flex justify-between items-center text-xs p-3 rounded-lg border border-border-card/40 bg-bg-base/30">
                        <span className="font-bold">{userName || 'You'}</span>
                        <span className="font-bold text-primary font-mono">{playerScore} bug fixed</span>
                      </div>
                      <div className="flex justify-between items-center text-xs p-3 rounded-lg border border-border-card/40 bg-bg-base/30">
                        <span className="font-bold">{opponentName}</span>
                        <span className="font-bold text-orange-500 font-mono">{opponentScore} bug fixed</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          )}

          {/* View 5: RESULT SCREEN */}
          {view === 'result' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto bg-bg-card border border-border-card rounded-2xl p-6 md:p-8 shadow-lg flex flex-col gap-8 text-center relative overflow-hidden"
            >
              {/* Confetti light sparkles */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,83,0.06)_0%,transparent_70%)] pointer-events-none" />

              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-bold font-mono text-primary uppercase tracking-wider">MATCH COMPLETED</span>
                <h2 className={`text-4xl font-black uppercase tracking-tight ${matchResult === 'victory' ? 'text-primary' : matchResult === 'defeat' ? 'text-red-500' : 'text-text-muted'}`}>
                  {matchResult === 'victory' ? 'Victory 🎉' : matchResult === 'defeat' ? 'Defeat 💀' : 'Draw 🤝'}
                </h2>
                <p className="text-xs text-text-muted font-semibold mt-1">
                  {matchResult === 'victory' 
                    ? `You successfully outperformed ${opponentName} in coding speed and complexity!`
                    : `Competitor ${opponentName} completed the challenge ahead of you.`}
                </p>
              </div>

              {/* Match Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-base/30 border border-border-card/40 p-4 rounded-xl text-left">
                  <span className="text-[9px] font-mono font-bold text-text-muted uppercase">SUBMISSION SPEED</span>
                  <h4 className="text-lg font-black font-mono text-text-main mt-1">{subTime}</h4>
                </div>
                <div className="bg-bg-base/30 border border-border-card/40 p-4 rounded-xl text-left">
                  <span className="text-[9px] font-mono font-bold text-text-muted uppercase">XP EARNED</span>
                  <h4 className="text-lg font-black font-mono text-primary mt-1">+{xpEarned} XP</h4>
                </div>
                <div className="bg-bg-base/30 border border-border-card/40 p-4 rounded-xl text-left">
                  <span className="text-[9px] font-mono font-bold text-text-muted uppercase">RATING ADJUSTMENT</span>
                  <h4 className={`text-lg font-black font-mono mt-1 ${matchResult === 'victory' ? 'text-primary' : 'text-red-500'}`}>
                    {matchResult === 'victory' ? `+${ratingChange}` : `-${ratingChange}`} rating
                  </h4>
                </div>
                <div className="bg-bg-base/30 border border-border-card/40 p-4 rounded-xl text-left">
                  <span className="text-[9px] font-mono font-bold text-text-muted uppercase">complexity metrics</span>
                  <h4 className="text-sm font-black font-mono text-text-main mt-1.5">{execTime} / {memUsage}</h4>
                </div>
              </div>

              {/* Action items */}
              <div className="flex flex-col gap-3 mt-2">
                <Button 
                  variant="primary" 
                  onClick={() => handleStartLobby(selectedMode)}
                  className="w-full justify-center py-2.5 font-bold cursor-pointer"
                >
                  Play Rematch
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setView('landing')}
                  className="w-full justify-center py-2.5 font-bold cursor-pointer"
                >
                  Return to Lobby Landing
                </Button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </AppLayout>
  );
}
