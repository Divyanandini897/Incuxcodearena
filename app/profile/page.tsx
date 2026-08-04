'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { useGameState, getXpForNextLevel } from '@/src/lib/gameState';
import { PROBLEMS_DATA } from '@/src/data/data';
import { supabase } from '@/src/utils/supabaseClient';
import { 
  Award, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Clock,
  User,
  Settings,
  ArrowRight,
  Globe,
  Star,
  Mail,
  Hash,
  Laptop,
  Keyboard,
  Check,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '@/src/components/ui/Button';
import Badge from '@/src/components/ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ProfilePage() {
  const { 
    userName, 
    level, 
    xp, 
    streak, 
    avatar, 
    solvedIds,
    updateUserName
  } = useGameState();

  const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'bookmarks' | 'settings'>('overview');
  const [isMounted, setIsMounted] = useState(false);

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  // Settings editable state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('user@incuxai.com');
  const [memberId, setMemberId] = useState('MEM-9428-INC');
  const [editBio, setEditBio] = useState('Fullstack Developer. Building next-gen platforms and mastering algorithms one checkmark at a time.');
  const [editCountry, setEditCountry] = useState('India');
  const [editTheme, setEditTheme] = useState('One Dark');
  const [editKeybinding, setEditKeybinding] = useState('Standard');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setEditName(userName || 'Coder');
    
    // Load bookmarks
    const savedBookmarks = localStorage.getItem('codenode_bookmarks');
    if (savedBookmarks) {
      setBookmarkedIds(JSON.parse(savedBookmarks));
    }

    // Dynamic Auth fetch
    async function fetchUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setEditEmail(session.user.email || 'user@incuxai.com');
          setMemberId(`MEM-${session.user.id.substring(0, 5).toUpperCase()}-INC`);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profile?.name) {
            setEditName(profile.name);
          } else if (session.user.user_metadata?.full_name) {
            setEditName(session.user.user_metadata.full_name);
          } else {
            setEditName(session.user.email?.split('@')[0] || userName || 'Coder');
          }
        }
      } catch (err) {
        console.error('Error fetching profile user metadata:', err);
      }
    }
    fetchUserData();
  }, [userName]);

  const xpNeeded = getXpForNextLevel(level);

  // Filter bookmarked questions details
  const bookmarkedProblems = useMemo(() => {
    return PROBLEMS_DATA.filter(p => bookmarkedIds.includes(p.id));
  }, [bookmarkedIds]);

  // Remove bookmark action
  const handleRemoveBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarkedIds.filter(x => x !== id);
    setBookmarkedIds(updated);
    localStorage.setItem('codenode_bookmarks', JSON.stringify(updated));
  };

  // Handle saving settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      updateUserName(editName);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Recharts Data
  const weeklyData = [
    { day: 'Mon', solved: 2 }, { day: 'Tue', solved: 4 }, { day: 'Wed', solved: 1 },
    { day: 'Thu', solved: 5 }, { day: 'Fri', solved: 3 }, { day: 'Sat', solved: 0 }, { day: 'Sun', solved: 2 }
  ];

  const difficultyDistribution = [
    { name: 'Easy', value: solvedIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Easy').length || 2, color: '#00C853' },
    { name: 'Medium', value: solvedIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Medium').length || 1, color: '#D97706' },
    { name: 'Hard', value: solvedIds.filter(id => PROBLEMS_DATA.find(p => p.id === id)?.difficulty === 'Hard').length || 0, color: '#DC2626' }
  ];

  if (!isMounted) {
    return (
      <AppLayout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Initials from profile name
  const getInitials = (name: string) => {
    if (!name || name === 'Coder') return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-[1000px] mx-auto flex flex-col gap-10 select-none font-sans pb-16">
        
        {/* 1. Hero Profile Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border-card/25 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-card-custom min-h-[260px] group cursor-default transition-all duration-300">
          
          {/* Scenic backdrop illustration */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src="/profile_hero.png" 
              alt="Profile Backdrop" 
              loading="lazy"
              className="w-full h-full object-cover opacity-65 brightness-110 contrast-110 group-hover:scale-103 transition-transform duration-700 ease-out select-none pointer-events-none"
            />
            {/* Dynamic themed overlays & vignette */}
            <div className="absolute inset-0 bg-[var(--color-hero-overlay)]" />
            <div className="absolute inset-0 bg-[var(--color-hero-gradient)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.3)_100%)] mix-blend-multiply" />
          </div>

          {/* Left: Avatar details */}
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center relative z-10 text-white min-w-0">
            <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-bold text-primary shadow-md shrink-0 select-none backdrop-blur-md">
              {getInitials(editName)}
            </div>
            <div className="flex flex-col gap-1 text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight">{editName}</h1>
                <span className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  LVL {level}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">@{editName.toLowerCase().replace(/\s+/g, '')}</p>
              <p className="text-xs text-zinc-300 font-semibold mt-2 max-w-md leading-relaxed">
                {editBio}
              </p>
              <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-mono font-bold mt-3">
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-zinc-500" /> {editCountry}</span>
                <span>• Joined July 2026</span>
              </div>
            </div>
          </div>

          {/* Right: XP progress & edit trigger */}
          <div className="flex flex-col gap-4 relative z-10 w-full md:w-56 shrink-0 text-white select-none">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-400">
                <span>XP PROGRESS</span>
                <span>{xp}/{xpNeeded} XP</span>
              </div>
              <div className="w-full h-2 bg-black/40 border border-white/10 rounded-full overflow-hidden backdrop-blur-md">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,200,83,0.4)]"
                  style={{ width: `${Math.min(100, Math.floor((xp / xpNeeded) * 100))}%` }}
                />
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setActiveTab('settings')}
              className="w-full justify-center text-xs font-bold bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md cursor-pointer shrink-0"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-card/65 gap-6 select-none">
          {(['overview', 'statistics', 'bookmarks', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); }}
              className={`text-xs font-mono font-bold uppercase tracking-wider pb-3 transition-all relative cursor-pointer ${
                activeTab === tab 
                  ? 'text-primary' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="profile-tab-bar"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-10"
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. About Me section */}
                <div className="bg-bg-card border border-border-card rounded-2xl p-6 shadow-xs flex flex-col gap-5 text-left">
                  <h3 className="text-xs font-black uppercase font-mono tracking-wider text-text-main border-b border-border-card/45 pb-2.5 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> About Me
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-hover border border-border-card/45 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-text-muted font-mono font-bold uppercase">Name</span>
                        <span className="text-xs font-bold text-text-main mt-1">{editName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-hover border border-border-card/45 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-text-muted font-mono font-bold uppercase">Mail ID</span>
                        <span className="text-xs font-bold text-text-main mt-1">{editEmail}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-hover border border-border-card/45 flex items-center justify-center shrink-0">
                        <Hash className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-text-muted font-mono font-bold uppercase">Member ID</span>
                        <span className="text-xs font-bold font-mono text-text-main mt-1">{memberId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. My Progress Cards */}
                <div className="bg-bg-card border border-border-card rounded-2xl p-6 shadow-xs flex flex-col gap-5 text-left">
                  <h3 className="text-xs font-black uppercase font-mono tracking-wider text-text-main border-b border-border-card/45 pb-2.5 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" /> My Progress Cards
                  </h3>
                  <div className="flex flex-col gap-4">
                    {/* Algorithms solved */}
                    <div className="flex flex-col gap-2 p-3 bg-bg-base/20 border border-border-card/30 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted">
                        <span>ALGORITHMS SOLVED</span>
                        <span>{solvedIds.length} / 50</span>
                      </div>
                      <div className="w-full h-1.5 bg-hover rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (solvedIds.length / 50) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Streak targets */}
                    <div className="flex flex-col gap-2 p-3 bg-bg-base/20 border border-border-card/30 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted">
                        <span>STREAK WEEKLY TARGET</span>
                        <span>{streak} / 7 days</span>
                      </div>
                      <div className="w-full h-1.5 bg-hover rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Level XP targets */}
                    <div className="flex flex-col gap-2 p-3 bg-bg-base/20 border border-border-card/30 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted">
                        <span>NEXT LEVEL MILESTONE</span>
                        <span>{xp} / {xpNeeded} XP</span>
                      </div>
                      <div className="w-full h-1.5 bg-hover rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (xp / xpNeeded) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="flex flex-col gap-6">
                
                {/* 1. Bar Chart & Pie Chart Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-primary" /> Weekly Practice Output
                    </h4>
                    <div className="w-full h-48 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" vertical={false} />
                          <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-card)', fontSize: '10px' }} />
                          <Bar dataKey="solved" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-primary" /> Solve Distribution
                    </h4>
                    <div className="w-full h-48 mt-2 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={difficultyDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                            {difficultyDistribution.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 2. Coding Heatmap */}
                <div className="bg-bg-card border border-border-card rounded-xl p-6 shadow-xs flex flex-col gap-4 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" /> Coding Heatmap
                  </h4>
                  <div className="flex flex-col gap-3 overflow-x-auto custom-scrollbar pb-2">
                    <div className="flex gap-1.5 items-center text-[9px] font-mono font-bold text-text-muted mb-1">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded bg-hover/30 border border-border-card/25" />
                      <div className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary/10" />
                      <div className="w-2.5 h-2.5 rounded bg-primary/40 border border-primary/20" />
                      <div className="w-2.5 h-2.5 rounded bg-primary/70 border border-primary/30" />
                      <div className="w-2.5 h-2.5 rounded bg-primary border border-primary/50" />
                      <span>More</span>
                    </div>
                    <div className="flex gap-1">
                      {(() => {
                        const weeks = 24;
                        const daysPerWeek = 7;
                        const totalDays = weeks * daysPerWeek;
                        const solvedCount = solvedIds.length;
                        const today = new Date();
                        const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
                        const monthLabels: { index: number; label: string }[] = [];
                        const heatmapData: number[] = [];
                        for (let d = totalDays - 1; d >= 0; d--) {
                          const date = new Date(today);
                          date.setDate(today.getDate() - d);
                          if (date.getDate() === 1) {
                            monthLabels.push({
                              index: totalDays - 1 - d,
                              label: date.toLocaleString('en', { month: 'short' }),
                            });
                          }
                        }
                        for (let i = 0; i < totalDays; i++) {
                          const dayOfWeek = (new Date(today.getTime() - (totalDays - 1 - i) * 86400000)).getDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                          const weight = 1 + (i / totalDays);
                          const raw = (solvedCount * weight * 0.06) + (isWeekend ? 0.5 : 0);
                          const level = Math.min(4, Math.floor(raw + (Math.sin(i * 1.7) * 0.4 + 0.5)));
                          heatmapData.push(Math.max(0, level));
                        }
                        return (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex gap-0.5 ml-7">
                              {weeks > 0 && (() => {
                                const weekMonthLabels: { week: number; label: string }[] = [];
                                for (let w = 0; w < weeks; w++) {
                                  const dayIndex = w * 7;
                                  const date = new Date(today);
                                  date.setDate(today.getDate() - (totalDays - 1 - dayIndex));
                                  if (date.getDate() <= 7) {
                                    weekMonthLabels.push({ week: w, label: date.toLocaleString('en', { month: 'short' }) });
                                  }
                                }
                                return weekMonthLabels.map((wm, i) => (
                                  <div key={i} style={{ width: '14px', marginRight: '1px' }} className="text-[8px] font-mono text-text-muted text-center">
                                    {wm.label}
                                  </div>
                                ));
                              })()}
                            </div>
                            <div className="flex gap-0.5">
                              <div className="flex flex-col gap-0.5 mr-1.5">
                                {[1, 3, 5].map((dow) => (
                                  <div key={dow} className="h-3.5 flex items-center text-[8px] font-mono text-text-muted">
                                    {['', 'Mon', '', 'Wed', '', 'Fri', ''][dow]}
                                  </div>
                                ))}
                              </div>
                              {Array.from({ length: weeks }).map((_, w) => (
                                <div key={w} className="flex flex-col gap-0.5">
                                  {Array.from({ length: 7 }).map((_, d) => {
                                    const idx = w * 7 + d;
                                    const level = idx < heatmapData.length ? heatmapData[idx] : 0;
                                    const colorClass =
                                      level === 0 ? 'bg-hover/20 border border-border-card/30' :
                                      level === 1 ? 'bg-primary/20 border border-primary/10' :
                                      level === 2 ? 'bg-primary/40 border border-primary/20' :
                                      level === 3 ? 'bg-primary/70 border border-primary/35' :
                                                    'bg-primary border border-primary/50';
                                    return (
                                      <div
                                        key={d}
                                        className={`w-3.5 h-3.5 rounded-sm ${colorClass}`}
                                        title={`${new Date(today.getTime() - (totalDays - 1 - idx) * 86400000).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })} — ${level} contribution${level !== 1 ? 's' : ''}`}
                                      />
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-[9px] font-mono text-text-muted mt-1">
                      <span className="font-semibold text-text-main">{solvedIds.length}</span> problems solved in the last 24 weeks
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="bg-bg-card border border-border-card rounded-xl p-5 shadow-xs flex flex-col gap-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-1.5 pb-2 border-b border-border-card/45">
                  <Star className="w-4 h-4 text-primary fill-primary" /> Bookmarked Questions
                </h3>
                <div className="flex flex-col gap-2.5">
                  {bookmarkedProblems.length > 0 ? (
                    bookmarkedProblems.map((prob) => (
                      <div 
                        key={prob.id} 
                        onClick={() => window.location.href = `/problems/${prob.id}`}
                        className="flex items-center justify-between text-xs p-3 rounded-lg border border-border-card/40 hover:border-primary/25 bg-bg-base/30 hover:bg-hover/25 cursor-pointer transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="text-[12.5px] font-bold text-text-main group-hover:text-primary transition-colors truncate">
                            {prob.id}. {prob.title}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-text-muted bg-hover px-1.5 py-0.5 rounded border border-border-card/45 shrink-0">
                            {prob.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant={prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Medium' ? 'medium' : 'hard'}>
                            {prob.difficulty}
                          </Badge>
                          <button
                            onClick={(e) => handleRemoveBookmark(prob.id, e)}
                            className="p-1 rounded hover:bg-hover text-text-muted hover:text-red-500 cursor-pointer transition-colors"
                            title="Remove Bookmark"
                          >
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 group-hover:scale-95 transition-transform" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-text-muted py-10 flex flex-col items-center gap-2">
                      <Star className="w-8 h-8 opacity-35" />
                      <span>No bookmarked questions yet. Explore the Practice Arena to add bookmarks!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="flex flex-col gap-6 max-w-xl w-full">
                <form onSubmit={handleSaveSettings} className="bg-bg-card border border-border-card rounded-2xl p-6 shadow-card-custom text-left flex flex-col gap-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card/45 pb-2">
                    Profile Settings
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-text-muted" /> Display Name
                      </label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg p-2.5 text-xs text-text-main"
                        placeholder="Coder Name"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-text-muted" /> Email Address
                      </label>
                      <input 
                        type="email" 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg p-2.5 text-xs text-text-main"
                        placeholder="user@incuxai.com"
                      />
                    </div>

                    {/* Country */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-text-muted" /> Country
                      </label>
                      <input 
                        type="text" 
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        className="bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg p-2.5 text-xs text-text-main"
                        placeholder="e.g. India, United States"
                      />
                    </div>

                    {/* Editor Theme Preference */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-text-muted" /> Editor Theme
                      </label>
                      <select
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                        className="bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg p-2.5 text-xs text-text-main cursor-pointer"
                      >
                        <option>One Dark</option>
                        <option>Light Theme</option>
                        <option>High Contrast</option>
                      </select>
                    </div>

                    {/* Keyboard layout */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        <Keyboard className="w-3.5 h-3.5 text-text-muted" /> Keybinding Mode
                      </label>
                      <select
                        value={editKeybinding}
                        onChange={(e) => setEditKeybinding(e.target.value)}
                        className="bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg p-2.5 text-xs text-text-main cursor-pointer"
                      >
                        <option>Standard</option>
                        <option>Vim Mode</option>
                        <option>Emacs Mode</option>
                      </select>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        Biography
                      </label>
                      <textarea 
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg p-2.5 text-xs text-text-main min-h-[80px] resize-none"
                        placeholder="Write a brief bio..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between pt-2 border-t border-border-card/40">
                    <div>
                      {isSaved && (
                        <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5 animate-pulse">
                          <Check className="w-4 h-4" /> Changes saved successfully!
                        </span>
                      )}
                    </div>
                    <Button variant="primary" size="sm" type="submit" className="cursor-pointer">
                      Save Changes
                    </Button>
                  </div>
                </form>

                {/* Account Actions Card */}
                <div className="bg-bg-card border border-border-card rounded-2xl p-6 shadow-card-custom text-left flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-red-500">
                    Account Actions
                  </h4>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-[11.5px] text-text-muted leading-relaxed font-semibold">
                      Sign out of your active Incuxai Code Arena session on this device.
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 w-max shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </AppLayout>
  );
}
