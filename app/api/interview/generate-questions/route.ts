import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/src/lib/interview/ollamaService';
import { InterviewConfig } from '@/src/lib/interview/types';

const DEFAULT_MODEL = 'gemma3:4b';

function getModel(): string {
  const model = process.env.OLLAMA_MODEL;
  return model && model.trim() ? model.trim() : DEFAULT_MODEL;
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  let body: {
    config: InterviewConfig;
    previousAnswers?: { score: number; difficulty: string }[];
    previousQuestionTexts?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Missing or invalid request body' }, { status: 400 });
  }

  const config = body?.config;
  if (!config) {
    return NextResponse.json({ error: 'Missing config' }, { status: 400 });
  }

  const model = getModel();
  console.log(
    `[generate-questions] request start model=${model} category=${config.category} language=${config.language || 'none'} topics=${JSON.stringify(config.topics)} difficulty=${config.difficulty}`
  );

  try {
    const questions = await generateQuestions(
      config,
      body.previousAnswers || [],
      3,
      body.previousQuestionTexts || []
    );

    console.log(
      `[generate-questions] request complete model=${model} category=${config.category} language=${config.language || 'none'} topics=${JSON.stringify(config.topics)} difficulty=${config.difficulty} questions=${questions.length} durationMs=${Date.now() - startedAt}`
    );

    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate questions';
    console.error(
      `[generate-questions] request error model=${model} category=${config.category} language=${config.language || 'none'} topics=${JSON.stringify(config.topics)} difficulty=${config.difficulty} message=${message} durationMs=${Date.now() - startedAt}`
    );
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
