'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, XCircle, Brain, ArrowRight, SkipForward, Sparkles } from 'lucide-react';
import AppLayout from '@/src/components/AppLayout';
import { useInterviewSession } from '@/src/hooks/useInterviewSession';
import SessionHeader from '@/src/components/interview/SessionHeader';
import QuestionDisplay from '@/src/components/interview/QuestionDisplay';
import ActiveListening from '@/src/components/interview/ActiveListening';
import FeedbackDisplay from '@/src/components/interview/FeedbackDisplay';
import {
  categoryLabels,
  programmingLanguages,
  categoryTopics,
  languageTopics,
} from '@/src/lib/interview/data';
import { InterviewCategory, ProgrammingLanguage } from '@/src/lib/interview/types';

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    }>
      <InterviewSession />
    </Suspense>
  );
}

function InterviewSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useInterviewSession();
  const {
    phase,
    error,
    browserSupported,
    authChecked,
    userId,
    currentQuestion,
    currentIndex,
    transcript,
    interimTranscript,
    elapsedTime,
    feedback,
    initializeInterview,
    handleNext,
    DURATION,
  } = session;

  const [started, setStarted] = useState(false);

  const category = (searchParams.get('category') || '') as InterviewCategory;
  const language = (searchParams.get('language') || '') as ProgrammingLanguage;
  const topics = (searchParams.get('topics') || '').split(',').filter(Boolean);
  const difficulty = searchParams.get('difficulty') || 'mixed';

  const categoryLabel = categoryLabels[category] || category || 'General';
  const languageLabel = language
    ? programmingLanguages.find((l) => l.id === language)?.label || language
    : null;
  const topicsSource = category === 'programming-languages' && language
    ? languageTopics[language] || []
    : categoryTopics[category] || [];
  const topicLabels = topics.length > 0
    ? topics.map((t) => topicsSource.find((x) => x.id === t)?.label || t)
    : ['General Topics'];
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  const handleStart = () => {
    setStarted(true);
    initializeInterview();
  };

  if (browserSupported === false) {
    return (
      <AppLayout>
        <div className="flex-1 w-full max-w-[800px] mx-auto flex flex-col items-center justify-center gap-4 p-6">
          <AlertCircle className="w-12 h-12 text-yellow-400" />
          <h2 className="text-lg font-bold text-text-main">Browser Not Supported</h2>
          <p className="text-sm text-text-muted text-center">
            Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
          </p>
          <button
            onClick={() => router.push('/interview')}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-black transition-all cursor-pointer select-none"
          >
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex-1 w-full max-w-[800px] mx-auto flex flex-col items-center justify-center gap-4 p-6">
          <XCircle className="w-12 h-12 text-red-400" />
          <h2 className="text-lg font-bold text-text-main">Failed to Start Interview</h2>
          <p className="text-sm text-text-muted text-center">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90 transition-all cursor-pointer select-none"
            >
              <Sparkles className="w-3.5 h-3.5" /> Try Again
            </button>
            <button
              onClick={() => router.push('/interview')}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-bg-base text-text-muted hover:bg-bg-base/80 hover:text-text-main transition-all cursor-pointer select-none border border-border-card/60"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-[1000px] mx-auto flex flex-col gap-4 select-none font-sans pb-6">
        <SessionHeader elapsedTime={elapsedTime} duration={DURATION} />

        <div className="bg-bg-card border border-border-card/70 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.3)] flex flex-col min-h-[500px]">
          <div className="flex-1 p-6 flex flex-col gap-4">
            {phase === 'init' && !authChecked && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-sm text-text-muted font-semibold">Checking authentication...</p>
              </div>
            )}

            {phase === 'init' && authChecked && !userId && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-yellow-400" />
                <p className="text-sm text-text-muted text-center">You must be logged in to start an interview.</p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-black transition-all cursor-pointer select-none"
                >
                  Go to Login
                </button>
              </div>
            )}

            {phase === 'init' && authChecked && userId && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
                {!started ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>

                    <div className="text-center flex flex-col gap-1.5">
                      <h3 className="text-2xl font-black text-text-main">Ready to Start Your Interview</h3>
                      <p className="text-sm text-text-muted font-semibold max-w-[460px]">
                        Your questions will be generated from the selections below and asked aloud.
                        Make sure your microphone is ready before you begin.
                      </p>
                    </div>

                    <div className="bg-bg-base border border-border-card/50 rounded-xl p-5 w-full max-w-[460px] flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-wider">Category</span>
                        <span className="text-xs font-bold text-text-main">{categoryLabel}</span>
                      </div>
                      {languageLabel && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-wider">Language</span>
                          <span className="text-xs font-bold text-text-main">{languageLabel}</span>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-wider pt-0.5">Topics</span>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {topicLabels.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-1 rounded-md bg-bg-card border border-border-card/50 text-[10px] font-bold text-primary"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-wider">Difficulty</span>
                        <span className="text-xs font-bold text-text-main">{difficultyLabel}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleStart}
                      className="flex items-center gap-2.5 px-10 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wide font-mono bg-primary text-black shadow-[0_8px_32px_-8px_rgba(0,234,100,0.35)] hover:shadow-[0_8px_40px_-6px_rgba(0,234,100,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer select-none"
                    >
                      <Sparkles className="w-4 h-4" /> Start Interview
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-muted font-semibold">Generating your questions...</p>
                    <p className="text-xs text-text-muted/60 max-w-[360px] text-center">
                      The AI is preparing questions for your selected topics. This may take about a minute.
                    </p>
                  </div>
                )}
              </div>
            )}

            {phase !== 'init' && currentQuestion && (
              <>
                <QuestionDisplay currentQuestion={currentQuestion} currentIndex={currentIndex} />

                {phase === 'listening' && (
                  <ActiveListening transcript={transcript} interimTranscript={interimTranscript} />
                )}

                {phase === 'processing' && (
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm text-text-muted font-semibold">Evaluating your answer...</span>
                  </div>
                )}

                {phase === 'feedback' && feedback && (
                  <FeedbackDisplay feedback={feedback} />
                )}

                {phase === 'completed' && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-text-main">Interview Completed</h3>
                    <p className="text-sm text-text-muted text-center max-w-[400px]">
                      Generating your final report...
                    </p>
                    <Loader2 className="w-6 h-6 text-primary animate-spin mt-4" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t border-border-card/50 flex items-center justify-between">
            <div>
              {phase === 'listening' && (
                <button
                  onClick={() => {
                    // Logic to stop and evaluate early would go here
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-bg-base text-text-muted hover:bg-bg-base/80 hover:text-text-main transition-all cursor-pointer select-none border border-border-card/60"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Skip
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {phase === 'feedback' && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90 transition-all cursor-pointer select-none"
                >
                  Next Question <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {phase === 'completed' && (
                <button
                  disabled
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-bg-base text-text-muted cursor-not-allowed select-none border border-border-card/40"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
