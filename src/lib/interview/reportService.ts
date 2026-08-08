import { supabaseAdmin } from '@/src/utils/supabaseAdmin';

function enrichError(error: { message?: string; code?: string; hint?: string; details?: string }) {
  const parts = [`Supabase error: ${error.message || 'Unknown'}`];
  if (error.code) parts.push(`[code=${error.code}]`);
  if (error.hint) parts.push(`hint: ${error.hint}`);
  if (error.details) parts.push(`details: ${error.details}`);
  return new Error(parts.join(' | '));
}

export async function saveInterviewReport(report: {
  sessionId: string;
  userId: string;
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
}) {
  const { data, error } = await supabaseAdmin
    .from('ai_interview_reports')
    .insert({
      session_id: report.sessionId,
      user_id: report.userId,
      overall_score: report.overallScore,
      technical_score: report.technicalScore,
      communication_score: report.communicationScore,
      confidence_score: report.confidenceScore,
      accuracy_score: report.accuracyScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      topics_to_improve: report.topicsToImprove,
      learning_recommendations: report.learningRecommendations,
      timeline: report.timeline,
    })
    .select()
    .single();

  if (error) throw enrichError(error);
  return data;
}

export async function getInterviewReport(reportId: string) {
  const { data, error } = await supabaseAdmin
    .from('ai_interview_reports')
    .select('*, session:ai_interview_sessions(*)')
    .eq('id', reportId)
    .single();

  if (error) throw enrichError(error);
  return data;
}

export async function getInterviewReportBySession(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('ai_interview_reports')
    .select('*, session:ai_interview_sessions(*)')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) throw enrichError(error);
  return data;
}

export async function getUserInterviewHistory(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('ai_interview_sessions')
    .select('*, report:ai_interview_reports(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw enrichError(error);
  return data;
}

export async function getUserInterviewReports(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('ai_interview_reports')
    .select('*, session:ai_interview_sessions(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw enrichError(error);
  return data;
}
