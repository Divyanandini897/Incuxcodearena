'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Award, TrendingUp, MessageSquare, Volume2,
  CheckCircle2, AlertTriangle, BookOpen, Target, Star,
  Download, RotateCcw, Brain, Zap,
} from 'lucide-react';
import AppLayout from '@/src/components/AppLayout';

interface ReportData {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  accuracy_score: number;
  strengths: string[];
  weaknesses: string[];
  topics_to_improve: string[];
  learning_recommendations: string[];
  timeline: { time: number; questionId: string; score: number }[];
  created_at: string;
  session: {
    category: string;
    language: string | null;
    topics: string[];
    difficulty: string;
    started_at: string;
  };
}

export default function InterviewReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/interview/report/${params.id}`);
      if (!res.ok) throw new Error('Report not found');
      const data = await res.json() as { report: ReportData };
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-text-muted font-semibold">Loading report...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !report) {
    return (
      <AppLayout>
        <div className="flex-1 w-full max-w-[800px] mx-auto flex flex-col items-center justify-center gap-4 p-6">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <h2 className="text-lg font-bold text-text-main">Report Not Found</h2>
          <p className="text-sm text-text-muted">{error || 'Could not load interview report'}</p>
          <button
            onClick={() => router.push('/interview/history')}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-black transition-all cursor-pointer select-none"
          >
            View History
          </button>
        </div>
      </AppLayout>
    );
  }

  const scores = [
    { label: 'Overall', score: report.overall_score, icon: Award },
    { label: 'Technical', score: report.technical_score, icon: Brain },
    { label: 'Communication', score: report.communication_score, icon: MessageSquare },
    { label: 'Confidence', score: report.confidence_score, icon: TrendingUp },
    { label: 'Accuracy', score: report.accuracy_score, icon: Target },
  ];

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-[1000px] mx-auto flex flex-col gap-5 select-none font-sans pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/interview/history')}
              className="w-9 h-9 rounded-xl bg-bg-card border border-border-card/60 flex items-center justify-center hover:border-border-card transition-all cursor-pointer select-none"
            >
              <ArrowLeft className="w-4 h-4 text-text-muted" />
            </button>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3" /> Interview Report
              </span>
              <h1 className="text-xl font-black text-text-main tracking-tight">Interview Results</h1>
            </div>
          </div>
          <div className="text-[10px] text-text-muted font-mono font-bold">
            {new Date(report.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </div>
        </div>

        {/* Session info */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {report.session.category}
          </span>
          {report.session.language && (
            <span className="px-2.5 py-1 rounded-lg bg-bg-card border border-border-card/60 text-text-muted">
              {report.session.language}
            </span>
          )}
          {report.session.topics?.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-bg-card border border-border-card/60 text-text-muted">
              {report.session.topics.slice(0, 2).join(', ')}
              {report.session.topics.length > 2 && ' + more'}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-lg border
            ${report.session.difficulty === 'easy' ? 'bg-green-400/10 border-green-400/20 text-green-400' : ''}
            ${report.session.difficulty === 'medium' ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400' : ''}
            ${report.session.difficulty === 'hard' ? 'bg-red-400/10 border-red-400/20 text-red-400' : ''}
            ${report.session.difficulty === 'mixed' ? 'bg-blue-400/10 border-blue-400/20 text-blue-400' : ''}
          `}>
            {report.session.difficulty}
          </span>
          <span className="ml-auto text-text-muted">{report.session.started_at ? new Date(report.session.started_at).toLocaleTimeString() : ''}</span>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {scores.map((s) => (
            <div key={s.label} className="bg-bg-card border border-border-card/60 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.2)]">
              <s.icon className={`w-5 h-5 ${getScoreColor(s.score)}`} />
              <span className={`text-2xl font-black font-mono ${getScoreColor(s.score)}`}>
                {s.score}
              </span>
              <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getScoreBarColor(s.score)}`} style={{ width: `${s.score}%` }} />
              </div>
              <span className="text-[9px] text-text-muted font-bold font-mono uppercase tracking-wider">{s.label}</span>
              <span className={`text-[9px] font-bold font-mono ${getScoreColor(s.score)}`}>{getScoreLabel(s.score)}</span>
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border-card/60 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.2)]">
            <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-green-400 flex items-center gap-1.5 mb-3">
              <Star className="w-3.5 h-3.5" /> Strengths
            </h3>
            {report.strengths.length > 0 ? (
              <div className="flex flex-col gap-2">
                {report.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-text-main font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    {s}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">No specific strengths identified.</p>
            )}
          </div>

          <div className="bg-bg-card border border-border-card/60 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.2)]">
            <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-yellow-400 flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" /> Areas to Improve
            </h3>
            {report.weaknesses.length > 0 ? (
              <div className="flex flex-col gap-2">
                {report.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-text-main font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 mt-1.5" />
                    {w}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">No weaknesses identified.</p>
            )}
          </div>
        </div>

        {/* Topics to Improve */}
        <div className="bg-bg-card border border-border-card/60 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.2)]">
          <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-text-main flex items-center gap-1.5 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-primary" /> Topics to Improve
          </h3>
          {report.topics_to_improve.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {report.topics_to_improve.map((t, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-bg-base border border-border-card/60 text-[11px] text-text-muted font-semibold">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">No specific topics identified.</p>
          )}
        </div>

        {/* Learning Recommendations */}
        <div className="bg-bg-card border border-border-card/60 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.2)]">
          <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-text-main flex items-center gap-1.5 mb-3">
            <Zap className="w-3.5 h-3.5 text-primary" /> Learning Recommendations
          </h3>
          {report.learning_recommendations.length > 0 ? (
            <div className="flex flex-col gap-2">
              {report.learning_recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-text-main font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-primary">{i + 1}</span>
                  </div>
                  {r}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">No recommendations available.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => router.push('/interview')}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-black text-xs font-bold hover:shadow-[0_4px_20px_-6px_var(--color-primary)] transition-all cursor-pointer select-none"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New Interview
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-bg-card border border-border-card/60 text-text-muted text-xs font-bold hover:border-border-card transition-all cursor-pointer select-none"
          >
            <Download className="w-3.5 h-3.5" /> Download Report
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
