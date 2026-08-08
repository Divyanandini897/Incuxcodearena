import { NextRequest, NextResponse } from 'next/server';
import { createInterviewSession } from '@/src/lib/interview/interviewService';
import { InterviewConfig } from '@/src/lib/interview/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, config } = body as { userId: string; config: InterviewConfig };

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId — user must be logged in' }, { status: 400 });
    }
    if (!config?.category || !config?.difficulty) {
      return NextResponse.json({ error: 'Missing category or difficulty in config' }, { status: 400 });
    }

    const session = await createInterviewSession(userId, config);
    return NextResponse.json({ session });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create session';
    console.error('Create session error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
