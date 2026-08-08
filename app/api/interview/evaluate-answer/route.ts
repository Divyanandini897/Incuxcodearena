import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswer } from '@/src/lib/interview/ollamaService';
import { getFallbackEvaluation } from '@/src/lib/interview/evaluationService';
import { Question } from '@/src/lib/interview/types';

export async function POST(req: NextRequest) {
  try {
    const { question, userAnswer } = await req.json() as {
      question: Question;
      userAnswer: string;
    };

    if (!question || !userAnswer) {
      return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 });
    }

    try {
      const evaluation = await evaluateAnswer(question, userAnswer);
      return NextResponse.json({ evaluation });
    } catch {
      const fallback = getFallbackEvaluation(question, userAnswer);
      return NextResponse.json({ evaluation: fallback });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to evaluate answer';
    console.error('Evaluate answer error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
