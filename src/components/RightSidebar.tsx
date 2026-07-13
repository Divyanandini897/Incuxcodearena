'use client';

import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  MessageSquare,
  Zap,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface RightSidebarProps {
  onSelectProblem?: (id: number) => void;
  dailyProblemId?: number;
}

export default function RightSidebar({ onSelectProblem, dailyProblemId = 1 }: RightSidebarProps) {
  // Calendar dates placeholder
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = 28; // mock representation for dashboard grid
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const upcomingContests = [
    { name: 'Weekly Algorithmic Sprint 82', time: 'Tomorrow, 6:00 PM', reward: '500 XP' },
    { name: 'IncuXai AI Cup #4', time: 'July 15, 9:00 AM', reward: '1000 XP + Gold' }
  ];

  const recentDiscussions = [
    { title: 'Optimizing O(N log N) merge algorithms', author: 'neocode', replies: 14 },
    { title: 'Why is standard dynamic array resize O(1) amortized?', author: 'algo_witch', replies: 8 }
  ];

  return (
    <aside className="w-full xl:w-80 flex flex-col gap-6 shrink-0 xl:sticky xl:top-[88px] h-fit pb-8 select-none">
      
      {/* 1. Daily Challenge Banner Card */}
      <div 
        onClick={() => onSelectProblem && onSelectProblem(dailyProblemId)}
        className="group relative bg-gradient-to-br from-[var(--color-primary)] to-emerald-700 dark:from-[var(--color-primary)] dark:to-emerald-800 text-white rounded-2xl p-5 shadow-lg cursor-pointer hover:scale-[1.01] hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Glow shape */}
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
        
        <div className="flex items-center gap-2 mb-2.5">
          <Zap className="w-4 h-4 text-yellow-300 animate-pulse fill-yellow-300" />
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-100">
            Daily Quest
          </span>
        </div>
        <h4 className="text-sm font-black tracking-tight leading-snug text-white group-hover:text-yellow-100 transition-colors">
          Two Sum Challenge
        </h4>
        <p className="text-xs text-emerald-100/90 leading-relaxed font-medium mt-1">
          Solve today's challenge to maintain your streak and claim +100 XP.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-yellow-200 mt-4.5 font-bold font-mono">
          <span>Solve Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 2. Upcoming Contests */}
      <div className="bg-bg-card rounded-2xl border border-border-card p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-card pb-2.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main">
              Upcoming Contests
            </h4>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {upcomingContests.map((c, i) => (
            <div key={i} className="flex flex-col gap-1 text-xs border-b border-border-card/40 last:border-none pb-3 last:pb-0">
              <span className="font-extrabold text-text-main hover:text-primary transition-colors cursor-pointer leading-snug">
                {c.name}
              </span>
              <div className="flex justify-between items-center text-[10px] text-text-muted mt-0.5 font-semibold font-mono">
                <span>{c.time}</span>
                <span className="text-primary">{c.reward}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AI Coding Tip Card */}
      <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-3 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
          <span>AI Coding Tip</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed font-medium">
          "When analyzing complex array elements, consider starting with the **Two Pointers** approach. It often reduces time complexity from $O(N^2)$ to $O(N)$ with no extra memory allocation."
        </p>
      </div>

      {/* 4. Mini Activity Calendar Grid */}
      <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-text-main text-xs font-bold uppercase tracking-wider border-b border-border-card pb-2.5">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <span>Practice Heatmap</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-text-muted/65 font-bold mb-1">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
          {calendarDays.map((day) => {
            const isToday = day === currentDay;
            const isPast = day < currentDay;

            return (
              <div 
                key={day}
                className={`aspect-square flex items-center justify-center rounded-md font-bold ${
                  isToday 
                    ? 'bg-primary text-white font-extrabold ring-2 ring-primary/20 shadow-sm' 
                    : isPast 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-bg-base text-text-muted/40 border border-transparent'
                }`}
                title={isToday ? "Active Today" : ""}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Discussions */}
      <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-card pb-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main">
              Recent Discussions
            </h4>
          </div>
        </div>
        <div className="flex flex-col gap-3.5">
          {recentDiscussions.map((d, i) => (
            <div key={i} className="flex flex-col gap-1 text-xs border-b border-border-card/45 last:border-none pb-3 last:pb-0">
              <span className="font-extrabold text-text-main hover:text-primary transition-colors leading-snug cursor-pointer">
                {d.title}
              </span>
              <div className="flex justify-between items-center text-[10px] text-text-muted mt-0.5 font-bold font-mono">
                <span>@{d.author}</span>
                <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {d.replies}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quick Links */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-text-muted font-bold font-mono mt-1 px-1">
        <Link href="/" className="hover:text-primary flex items-center gap-0.5">Rules <ExternalLink className="w-2.5 h-2.5" /></Link>
        <Link href="/" className="hover:text-primary flex items-center gap-0.5">Platform API <ExternalLink className="w-2.5 h-2.5" /></Link>
        <Link href="/" className="hover:text-primary flex items-center gap-0.5">FAQ & Help <ExternalLink className="w-2.5 h-2.5" /></Link>
        <span>© 2026 IncuXai Inc.</span>
      </div>

    </aside>
  );
}
