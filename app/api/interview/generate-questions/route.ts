import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/src/lib/interview/ollamaService';
import { InterviewConfig } from '@/src/lib/interview/types';

export async function POST(req: NextRequest) {
  try {
    const { config, previousAnswers, previousQuestionTexts } = await req.json() as {
      config: InterviewConfig;
      previousAnswers?: { score: number; difficulty: string }[];
      previousQuestionTexts?: string[];
    };

    if (!config) {
      return NextResponse.json({ error: 'Missing config' }, { status: 400 });
    }

    const questions = await generateQuestions(
      config,
      previousAnswers || [],
      5,
      previousQuestionTexts || []
    );

    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate questions';
    console.error('Generate questions error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
