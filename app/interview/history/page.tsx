'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  History, Award, ChevronRight, Calendar, Clock,
  BarChart3, Brain, Sparkles, Star, AlertCircle,
} from 'lucide-react';
import AppLayout from '@/src/components/AppLayout';
import { supabase } from '@/src/utils/supabaseClient';

interface SessionItem {
  id: string;
  category: string;
  language: string | null;
  topics: string[];
  difficulty: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  report: {
    id: string;
    overall_score: number;
  } | null;
}

export default function InterviewHistory() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch(`/api/interview/history?type=sessions&userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json() as { data: SessionItem[] };
      setSessions(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'mixed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-text-muted bg-bg-card border-border-card/60';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex-1 w-full max-w-[800px] mx-auto flex flex-col items-center justify-center gap-4 p-6">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h2 className="text-lg font-bold text-text-main">Error</h2>
          <p className="text-sm text-text-muted">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-black transition-all cursor-pointer select-none"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-[1000px] mx-auto flex flex-col gap-5 select-none font-sans pb-10">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider flex items-center gap-1">
            <History className="w-3 h-3" /> History
          </span>
          <h1 className="text-2xl font-black text-text-main tracking-tight">Interview History</h1>
          <p className="text-sm text-text-muted font-semibold">Review your past AI voice interviews and reports.</p>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Brain className="w-12 h-12 text-text-muted/30" />
            <h3 className="text-sm font-bold text-text-main">No Interviews Yet</h3>
            <p className="text-xs text-text-muted max-w-[300px]">
              Start your first AI voice interview to see your history here.
            </p>
            <button
              onClick={() => router.push('/interview')}
              className="mt-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-black transition-all cursor-pointer select-none"
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
              Start Interview
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  if (session.report) {
                    router.push(`/interview/report/${session.report.id}`);
                  }
                }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-bg-card border border-border-card/60 hover:border-border-card hover:bg-bg-card/80 transition-all text-left cursor-pointer select-none"
              >
                {/* Score badge */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                  ${session.report
                    ? session.report.overall_score >= 80
                      ? 'bg-green-400/10'
                      : session.report.overall_score >= 60
                        ? 'bg-yellow-400/10'
                        : 'bg-red-400/10'
                    : 'bg-bg-base'
                  }`}
                >
                  {session.report ? (
                    <span className={`text-sm font-black font-mono
                      ${session.report.overall_score >= 80 ? 'text-green-400' : ''}
                      ${session.report.overall_score >= 60 && session.report.overall_score < 80 ? 'text-yellow-400' : ''}
                      ${session.report.overall_score < 60 ? 'text-red-400' : ''}
                    `}>
                      {session.report.overall_score}
                    </span>
                  ) : (
                    <BarChart3 className="w-5 h-5 text-text-muted/50" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-text-main capitalize">
                      {session.category.replace(/-/g, ' ')}
                    </span>
                    {session.language && (
                      <span className="text-[10px] text-text-muted font-mono font-bold px-1.5 py-0.5 rounded bg-bg-base border border-border-card/60">
                        {session.language}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {session.created_at
                        ? new Date(session.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        : 'Unknown'}
                    </span>
                    <Clock className="w-3 h-3" />
                    <span>{session.completed_at ? 'Completed' : session.status}</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${getDifficultyColor(session.difficulty)}`}>
                      {session.difficulty}
                    </span>
                  </div>
                </div>

                {/* Topics chips */}
                {session.topics && session.topics.length > 0 && (
                  <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                    {session.topics.slice(0, 3).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[9px] text-text-muted font-semibold bg-bg-base border border-border-card/60">
                        {t}
                      </span>
                    ))}
                    {session.topics.length > 3 && (
                      <span className="text-[9px] text-text-muted">+{session.topics.length - 3}</span>
                    )}
                  </div>
                )}

                {session.report ? (
                  <div className="flex items-center gap-1 text-primary text-[10px] font-bold font-mono">
                    <Star className="w-3 h-3" />
                    View Report
                    <ChevronRight className="w-3 h-3" />
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted/50 font-mono">In Progress</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
