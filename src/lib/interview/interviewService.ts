import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { InterviewConfig } from './types';

function enrichError(error: { message?: string; code?: string; hint?: string; details?: string }) {
  const parts = [`Supabase error: ${error.message || 'Unknown'}`];
  if (error.code) parts.push(`[code=${error.code}]`);
  if (error.hint) parts.push(`hint: ${error.hint}`);
  if (error.details) parts.push(`details: ${error.details}`);
  return new Error(parts.join(' | '));
}

export async function createInterviewSession(userId: string, config: InterviewConfig) {
  const { data, error } = await supabaseAdmin
    .from('ai_interview_sessions')
    .insert({
      user_id: userId,
      category: config.category,
      language: config.language || null,
      topics: config.topics,
      difficulty: config.difficulty,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw enrichError(error);
  return data;
}

export async function getInterviewSession(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('ai_interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw enrichError(error);
  return data;
}

export async function updateInterviewSession(sessionId: string, updates: Record<string, unknown>) {
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    mapped[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = value;
  }

  const { error } = await supabaseAdmin
    .from('ai_interview_sessions')
    .update(mapped)
    .eq('id', sessionId);

  if (error) throw enrichError(error);
}
