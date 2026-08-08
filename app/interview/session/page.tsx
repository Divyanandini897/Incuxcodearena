'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, XCircle, Brain, ArrowRight, SkipForward } from 'lucide-react';
import AppLayout from '@/src/components/AppLayout';
import { useInterviewSession } from '@/src/hooks/useInterviewSession';
import SessionHeader from '@/src/components/interview/SessionHeader';
import QuestionDisplay from '@/src/components/interview/QuestionDisplay';
import ActiveListening from '@/src/components/interview/ActiveListening';
import FeedbackDisplay from '@/src/components/interview/FeedbackDisplay';

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

  useEffect(() => {
    if (phase === 'init' && authChecked && userId) {
      initializeInterview();
    }
  }, [phase, authChecked, userId, initializeInterview]);

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
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Brain className="w-16 h-16 text-primary/40" />
                <p className="text-sm text-text-muted font-semibold">Ready to start your interview</p>
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
