import { Question, AnswerEvaluation } from './types';

export function getFallbackEvaluation(
  _question: Question,
  userAnswer: string
): AnswerEvaluation {
  const wordCount = userAnswer.split(/\s+/).length;
  const score = Math.min(100, Math.max(10, Math.floor(wordCount * 2.5)));

  return {
    isCorrect: score >= 60,
    score,
    technicalAccuracy: Math.min(100, score + 5),
    completeness: Math.min(100, score),
    communication: Math.min(100, score + 10),
    confidence: Math.min(100, score + 15),
    feedback:
      score >= 60
        ? 'Good answer! You covered the key points well.'
        : 'Your answer was brief. Try to elaborate with specific examples and technical details.',
    modelAnswer: _question.modelAnswer,
    improvementTips:
      score >= 60
        ? ['Try to include more specific code examples', 'Mention performance implications']
        : ['Structure your answer with specific points', 'Use technical terminology', 'Provide examples'],
    missedPoints: score >= 60 ? [] : _question.keyPoints.slice(0, 2),
    strengths: ['Attempted to answer', 'Showed understanding of the topic'],
  };
}

export function getFallbackSummary(
  questions: { question: string; answer: string; score: number }[],
  _extra: { questionsAnswered: number; questionsSkipped: number; avgResponseTime: number; totalDuration: number }
): {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  accuracyScore: number;
  strengths: string[];
  weaknesses: string[];
  topicsToImprove: string[];
  learningRecommendations: string[];
} {
  const scores = questions.map((q) => q.score);
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    overallScore: Math.max(0, Math.min(100, Math.round(avg))),
    technicalScore: Math.max(0, Math.min(100, Math.round(avg + 5))),
    communicationScore: Math.max(0, Math.min(100, Math.round(avg + 10))),
    confidenceScore: Math.max(0, Math.min(100, Math.round(avg + 15))),
    accuracyScore: Math.max(0, Math.min(100, Math.round(avg - 5))),
    strengths: ['Attempted all questions', 'Showed willingness to learn'],
    weaknesses: ['Could provide more detailed explanations', 'Practice structuring answers'],
    topicsToImprove: ['Review core concepts', 'Practice verbal explanations'],
    learningRecommendations: ['Study fundamental concepts', 'Practice mock interviews regularly'],
  };
}
