import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SpeechService } from '@/src/lib/interview/speechService';
import { Question, AnswerEvaluation, InterviewQuestion as InterviewQ } from '@/src/lib/interview/types';
import { supabase } from '@/src/utils/supabaseClient';

export type SessionPhase = 'init' | 'ready' | 'speaking-question' | 'listening' | 'processing' | 'evaluating' | 'feedback' | 'completed';

export function useInterviewSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const DURATION = 300;
  const SILENCE_TIMEOUT = 3500;

  const speechRef = useRef<SpeechService | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const transcriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const questionsRef = useRef<InterviewQ[]>([]);
  const currentQuestionRef = useRef<InterviewQ | null>(null);
  const phaseRef = useRef<SessionPhase>('init');
  const currentIndexRef = useRef(0);
  const stopFnRef = useRef<(() => void) | null>(null);
  const initializingRef = useRef(false);

  const [phase, setPhase] = useState<SessionPhase>('init');
  const [error, setError] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState<boolean | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionSaved, setIsSessionSaved] = useState(false);

  const [questions, setQuestions] = useState<InterviewQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState<AnswerEvaluation | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  const [config] = useState(() => ({
    category: searchParams.get('category') || '',
    language: searchParams.get('language') || undefined,
    topics: (searchParams.get('topics') || '').split(',').filter(Boolean),
    difficulty: searchParams.get('difficulty') || 'mixed',
  }));

  const currentQuestion = questions[currentIndex] || null;

  // Sync refs
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { interimTranscriptRef.current = interimTranscript; }, [interimTranscript]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const service = new SpeechService();
    speechRef.current = service;
    setBrowserSupported(service.isSupported);
    return () => service.destroy();
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setMicPermission(true))
      .catch(() => setMicPermission(false));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        setAuthChecked(true);
      } else {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/auth/login?redirect=${returnUrl}`);
      }
    });
  }, [router]);

  // Main Session Logic functions below...
  const checkAndEval = useCallback((text: string) => {
    const q = currentQuestionRef.current;
    if (!q) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    setPhase('processing');

    setQuestions((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((item) => item.id === q.id);
      if (idx >= 0) updated[idx] = { ...updated[idx], userAnswer: trimmed, answeredAt: Date.now() };
      return updated;
    });

    (async () => {
      try {
        const res = await fetch('/api/interview/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q.question, userAnswer: trimmed }),
        });
        if (!res.ok) throw new Error('Evaluation failed');
        const data = await res.json() as { evaluation: AnswerEvaluation };
        setQuestions((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((item) => item.id === q.id);
          if (idx >= 0) updated[idx] = { ...updated[idx], evaluation: data.evaluation };
          return updated;
        });
        setFeedback(data.evaluation);
        setPhase('feedback');
      } catch (err) {
        console.error(err);
        setPhase('listening');
      }
    })();
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (speechRef.current?.isActive) {
        speechRef.current.stopListening();
        const latestText = transcriptRef.current;
        if (latestText.trim()) checkAndEval(latestText);
      }
    }, SILENCE_TIMEOUT);
  }, [clearSilenceTimer, checkAndEval]);

  const startListening = useCallback(() => {
    const service = speechRef.current;
    if (!service) return;

    setPhase('listening');
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    interimTranscriptRef.current = '';

    let finalText = '';
    service.onTranscript((text: string, isFinal: boolean) => {
      if (isFinal) {
        finalText += (finalText ? ' ' : '') + text;
        transcriptRef.current = finalText;
        setTranscript(finalText);
        setInterimTranscript('');
        interimTranscriptRef.current = '';
        resetSilenceTimer();
      } else {
        interimTranscriptRef.current = text;
        setInterimTranscript(text);
      }
    });

    service.onError((err: string) => {
      setError(err);
      setPhase('ready');
    });

    service.onEnd(() => {});
    service.startListening();

    stopFnRef.current = () => {
      clearSilenceTimer();
      service.stopListening();
      if (finalText.trim()) checkAndEval(finalText);
    };
  }, [resetSilenceTimer, clearSilenceTimer, checkAndEval]);

  const askQuestion = useCallback(async (q: InterviewQ) => {
    if (!speechRef.current) return;
    setPhase('speaking-question');
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    interimTranscriptRef.current = '';
    setFeedback(null);
    clearSilenceTimer();

    setQuestions((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((item) => item.id === q.id);
      if (idx >= 0) updated[idx] = { ...updated[idx], startedAt: Date.now() };
      return updated;
    });

    await speechRef.current.speak(q.question.text);
    if (phaseRef.current === 'speaking-question') {
      startListening();
    }
  }, [clearSilenceTimer, startListening]);

  const handleInterviewEnd = useCallback(async () => {
    if (isSessionSaved) return;
    setIsSessionSaved(true);
    setPhase('completed');
    if (timerRef.current) clearInterval(timerRef.current);

    const qs = questionsRef.current;
    const answeredQs = qs.filter((q) => q.userAnswer && q.evaluation);
    const skippedCount = qs.filter((q) => q.skipped).length;

    if (answeredQs.length > 0 && userId && sessionId) {
      try {
        const responseTimes = answeredQs.filter(q => q.startedAt && q.answeredAt).map(q => (q.answeredAt! - q.startedAt!) / 1000);
        const avgRespTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

        const summaryRes = await fetch('/api/interview/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: answeredQs.map(q => ({ question: q.question.text, answer: q.userAnswer || '', score: q.evaluation?.score || 0 })),
            extra: { questionsAnswered: answeredQs.length, questionsSkipped: skippedCount, avgResponseTime: avgRespTime, totalDuration: elapsedTime },
          }),
        });

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          const saveRes = await fetch('/api/interview/save-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId, userId,
              overallScore: summaryData.overallScore || 0,
              technicalScore: summaryData.technicalScore || 0,
              communicationScore: summaryData.communicationScore || 0,
              confidenceScore: summaryData.confidenceScore || 0,
              accuracyScore: summaryData.accuracyScore || 0,
              strengths: summaryData.strengths || [],
              weaknesses: summaryData.weaknesses || [],
              topicsToImprove: summaryData.topicsToImprove || [],
              learningRecommendations: summaryData.learningRecommendations || [],
              timeline: answeredQs.map(q => ({ time: q.answeredAt ? (q.answeredAt - (q.startedAt || q.answeredAt)) / 1000 : 0, questionId: q.id, score: q.evaluation?.score || 0 })),
            }),
          });
          if (saveRes.ok) {
            const data = await saveRes.json() as { reportId: string };
            router.push(`/interview/report/${data.reportId}`);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (sessionId) {
      await fetch('/api/interview/update-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, updates: { status: 'completed', completedAt: new Date().toISOString() } }),
      }).catch(() => {});
    }

    router.push('/interview/history');
  }, [isSessionSaved, userId, sessionId, elapsedTime, router]);

  const handleNext = useCallback(async () => {
    const nextIndex = currentIndexRef.current + 1;
    const qs = questionsRef.current;

    if (nextIndex >= qs.length) {
      const answeredQ = qs.filter((q) => q.evaluation);
      if (answeredQ.length > 0) {
        handleInterviewEnd();
        return;
      }
    }

    setCurrentIndex(nextIndex);
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    interimTranscriptRef.current = '';
    setFeedback(null);
    setPhase('ready');

    const answeredQ = qs.filter((q) => q.evaluation);
    if (answeredQ.length >= 2 && !qs[nextIndex]) {
      try {
        const res = await fetch('/api/interview/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config,
            previousAnswers: answeredQ.map(q => ({ score: q.evaluation?.score || 50, difficulty: q.question.difficulty })),
            previousQuestionTexts: askedQuestions,
          }),
        });
        if (res.ok) {
          const data = await res.json() as { questions: Question[] };
          setAskedQuestions(prev => [...prev, ...data.questions.map(q => q.text)]);
          setQuestions(prev => [...prev, ...data.questions.map(q => ({ id: q.id, question: q }))]);
        }
      } catch (e) { console.warn(e); }
    }

    setTimeout(() => {
      const nextQ = questionsRef.current[nextIndex];
      if (nextQ) {
        if (!nextQ.evaluation) askQuestion(nextQ);
        else {
          setPhase('feedback');
          setFeedback(nextQ.evaluation);
          setTranscript(nextQ.userAnswer || '');
          transcriptRef.current = nextQ.userAnswer || '';
        }
      }
    }, 150);
  }, [config, askedQuestions, askQuestion, handleInterviewEnd]);

  useEffect(() => {
    if (phase === 'listening' || phase === 'speaking-question') {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= DURATION) return prev;
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, DURATION]);

  useEffect(() => {
    if (elapsedTime >= DURATION && phase !== 'completed') {
      handleInterviewEnd();
    }
  }, [elapsedTime, DURATION, phase, handleInterviewEnd]);

  const initializeInterview = useCallback(async () => {
    if (!userId) {
      setError('You must be logged in to start an interview');
      return;
    }
    if (initializingRef.current) return;
    initializingRef.current = true;
    setPhase('init');
    setError(null);
    try {
      const sessionRes = await fetch('/api/interview/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, config }),
      });
      if (!sessionRes.ok) throw new Error('Failed to create session');
      const sessionData = await sessionRes.json() as { session: { id: string } };
      setSessionId(sessionData.session.id);

      const res = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || 'Failed to generate questions');
      }
      const data = await res.json() as { questions: Question[] };
      setAskedQuestions(data.questions.map(q => q.text));
      setQuestions(data.questions.map(q => ({ id: q.id, question: q })));
      setPhase('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
      setPhase('init');
    } finally {
      initializingRef.current = false;
    }
  }, [userId, config]);

  useEffect(() => {
    if (phase === 'ready' && questions.length > 0 && !currentQuestion?.evaluation) {
      askQuestion(questions[0]);
    }
  }, [phase, questions, askQuestion, currentQuestion]);

  return {
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
  };
}
