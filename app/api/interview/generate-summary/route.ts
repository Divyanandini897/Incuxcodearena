import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewSummary } from '@/src/lib/interview/ollamaService';
import { getFallbackSummary } from '@/src/lib/interview/evaluationService';

export async function POST(req: NextRequest) {
  try {
    const { questions, extra } = await req.json() as {
      questions: { question: string; answer: string; score: number }[];
      extra: {
        questionsAnswered: number;
        questionsSkipped: number;
        avgResponseTime: number;
        totalDuration: number;
      };
    };

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No questions data provided' }, { status: 400 });
    }

    const safeExtra = extra || {
      questionsAnswered: questions.length,
      questionsSkipped: 0,
      avgResponseTime: 0,
      totalDuration: 0,
    };

    try {
      const summary = await generateInterviewSummary(questions, safeExtra);
      return NextResponse.json({ ...summary });
    } catch {
      const fallback = getFallbackSummary(questions, safeExtra);
      return NextResponse.json({ ...fallback });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate summary';
    console.error('Generate summary error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
