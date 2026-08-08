export type InterviewCategory =
  | 'programming-languages'
  | 'dsa'
  | 'machine-learning'
  | 'operating-systems'
  | 'dbms'
  | 'computer-networks'
  | 'algorithms'
  | 'aptitude'
  | 'hr';

export type ProgrammingLanguage =
  | 'java' | 'python' | 'javascript' | 'typescript'
  | 'c' | 'cpp' | 'go' | 'rust' | 'kotlin' | 'swift' | 'dart';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Topic {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  topic: string;
  category: InterviewCategory;
  modelAnswer: string;
  keyPoints: string[];
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  score: number;
  technicalAccuracy: number;
  completeness: number;
  communication: number;
  confidence: number;
  feedback: string;
  modelAnswer: string;
  improvementTips: string[];
  missedPoints: string[];
  strengths: string[];
}

export interface InterviewQuestion {
  id: string;
  question: Question;
  userAnswer?: string;
  evaluation?: AnswerEvaluation;
  startedAt?: number;
  answeredAt?: number;
  skipped?: boolean;
}

export interface InterviewConfig {
  category: InterviewCategory;
  language?: ProgrammingLanguage;
  topics: string[];
  difficulty: Difficulty | 'mixed';
}

export interface InterviewReport {
  id: string;
  userId: string;
  config: InterviewConfig;
  startedAt: string;
  duration: number;
  questions: InterviewQuestion[];
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  accuracyScore: number;
  strengths: string[];
  weaknesses: string[];
  topicsToImprove: string[];
  learningRecommendations: string[];
  timeline: { time: number; questionId: string; score: number }[];
  createdAt: string;
}

export type InterviewStatus = 'idle' | 'recording' | 'processing' | 'speaking' | 'evaluating' | 'completed';

export interface InterviewState {
  status: InterviewStatus;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  transcript: string;
  elapsedTime: number;
  isCompleted: boolean;
}

export interface VoiceState {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}
