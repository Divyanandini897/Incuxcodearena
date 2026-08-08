import { InterviewConfig, Question, AnswerEvaluation, Difficulty } from './types';

const DEFAULT_MODEL = 'gemma3:4b';
const DEFAULT_BASE_URL = 'http://localhost:11434';
const VERIFY_TIMEOUT_MS = 8000;
const DEFAULT_TIMEOUT_MS = 180000;

const SYSTEM_PROMPT = `You are an expert technical interviewer conducting a live voice interview.
Ask clear, conversational questions as if speaking aloud.
Evaluate answers based on technical accuracy, completeness, and clarity.
Provide constructive feedback and model answers.
Keep responses concise — this is a spoken interview format.`;

const EVALUATION_SCHEMA = {
  type: 'object',
  properties: {
    isCorrect: { type: 'boolean' },
    score: { type: 'number' },
    technicalAccuracy: { type: 'number' },
    completeness: { type: 'number' },
    communication: { type: 'number' },
    confidence: { type: 'number' },
    feedback: { type: 'string' },
    modelAnswer: { type: 'string' },
    improvementTips: { type: 'array', items: { type: 'string' } },
    missedPoints: { type: 'array', items: { type: 'string' } },
    strengths: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'isCorrect',
    'score',
    'technicalAccuracy',
    'completeness',
    'communication',
    'confidence',
    'feedback',
    'modelAnswer',
    'improvementTips',
    'missedPoints',
    'strengths',
  ],
};

const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    overallScore: { type: 'number' },
    technicalScore: { type: 'number' },
    communicationScore: { type: 'number' },
    confidenceScore: { type: 'number' },
    accuracyScore: { type: 'number' },
    strengths: { type: 'array', items: { type: 'string' } },
    weaknesses: { type: 'array', items: { type: 'string' } },
    topicsToImprove: { type: 'array', items: { type: 'string' } },
    learningRecommendations: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'overallScore',
    'technicalScore',
    'communicationScore',
    'confidenceScore',
    'accuracyScore',
    'strengths',
    'weaknesses',
    'topicsToImprove',
    'learningRecommendations',
  ],
};

function getModel(): string {
  const model = process.env.OLLAMA_MODEL;
  return model && model.trim() ? model.trim() : DEFAULT_MODEL;
}

function getBaseUrl(): string {
  const url = process.env.OLLAMA_BASE_URL;
  return url && url.trim() ? url.trim().replace(/\/+$/, '') : DEFAULT_BASE_URL;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return candidate;
  return candidate.slice(start, end + 1);
}

export async function verifyOllama(): Promise<void> {
  const model = getModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  let data: { models?: { name?: string }[] } | null = null;
  try {
    const res = await fetch(`${getBaseUrl()}/api/tags`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Ollama API responded with HTTP ${res.status}`);
    }
    data = await res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Ollama is not responding. Please start Ollama.');
    }
    throw new Error('Ollama is not running. Please start Ollama.');
  } finally {
    clearTimeout(timeout);
  }

  const installed = (data?.models ?? []).some((m) => {
    const name = m?.name ?? '';
    return name === model || name === model.split(':')[0];
  });

  if (!installed) {
    throw new Error(`The configured Ollama model "${model}" is not installed.`);
  }
}

async function chatJson<T>(
  prompt: string,
  temperature: number,
  maxTokens: number,
  format?: Record<string, unknown>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const model = getModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const payload: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };
    if (format) payload.format = format;

    const res = await fetch(`${getBaseUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startedAt;
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const detail = body ? ` - ${body}` : '';
      console.error(`[ollama] request failed model=${model} status=${res.status} durationMs=${durationMs}${detail}`);
      throw new Error(`Ollama request failed (${res.status} ${res.statusText})${detail}`);
    }

    console.log(`[ollama] request ok model=${model} status=${res.status} durationMs=${durationMs}`);
    const data = await res.json();
    const text: string | undefined = data?.message?.content;
    if (!text) throw new Error('Empty response from Ollama');

    try {
      return JSON.parse(extractJson(text)) as T;
    } catch {
      throw new Error('Ollama returned an invalid or incomplete response. Please try again.');
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Ollama request timed out after ${Math.round(timeoutMs / 1000)}s. The model "${model}" is too slow right now. Please try again.`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateQuestions(
  config: InterviewConfig,
  previousAnswers: { score: number; difficulty: string }[] = [],
  count: number = 5,
  previousQuestionTexts: string[] = []
): Promise<Question[]> {
  const model = getModel();
  const startedAt = Date.now();
  console.log(
    `[interview:generate-questions] start model=${model} category=${config.category} language=${config.language || 'none'} topics=${JSON.stringify(config.topics)} difficulty=${config.difficulty} count=${count} prevQuestions=${previousQuestionTexts.length}`
  );

  try {
    await verifyOllama();

    const categoryLabel = config.category === 'programming-languages'
      ? config.language || 'Programming'
      : config.category;

    const topicList = config.topics.length > 0 ? config.topics.join(', ') : 'general topics';

    const languageInstruction = config.language
      ? `All questions MUST be specifically about ${config.language} programming (syntax, idioms, and features of ${config.language}). Do NOT ask about any other programming language.`
      : '';

    const difficultyInstruction = config.difficulty === 'mixed'
      ? `Use a mix of easy, medium, and hard questions.`
      : `Every question MUST be at ${config.difficulty} difficulty. Do not make them harder or easier than ${config.difficulty}.`;

    const previousPerformance = previousAnswers.length > 0
      ? `\nPrevious answers performance (scores out of 100):\n${previousAnswers.map((a, i) => `Q${i + 1}: score=${a.score}, difficulty=${a.difficulty}`).join('\n')}`
      : '';

    const excludeInstruction = previousQuestionTexts.length > 0
      ? `\nDO NOT repeat any of these previously asked questions:\n${previousQuestionTexts.map((t, i) => `${i + 1}. "${t}"`).join('\n')}`
      : '';

    const dynamicDifficulty: Difficulty = (() => {
      if (previousAnswers.length === 0) {
        if (config.difficulty === 'mixed') return 'medium';
        return config.difficulty as Difficulty;
      }
      const avg = previousAnswers.reduce((s, a) => s + a.score, 0) / previousAnswers.length;
      if (config.difficulty === 'mixed') {
        if (avg < 40) return 'easy';
        if (avg < 70) return 'medium';
        return 'hard';
      }
      return config.difficulty as Difficulty;
    })();

    const prompt = `Generate ${count} technical interview questions.
You MUST ask questions ONLY about these exact topics: ${topicList}.
${languageInstruction}
${difficultyInstruction}
${excludeInstruction}
${previousPerformance}

All questions must be unique. Do not repeat a question.
Keep answers to a verbal format: each question should be answerable aloud in 30-60 seconds.
Keep model answers CONCISE (2-3 sentences max) so the total output stays short.

For each question, return a JSON object with:
- "questions": an array of question objects, each with:
  - "text": a clear, conversational question (as if an interviewer is speaking aloud)
  - "topic": one of the topics listed above
  - "difficulty": "${dynamicDifficulty}"
  - "modelAnswer": a concise model answer with the essential technical points
  - "keyPoints": 3 key points a good answer should cover

Output ONLY the JSON object. Do not wrap it in markdown code fences or add any commentary.`;

    const parsed = await chatJson<
      { questions?: { text?: string; topic?: string; difficulty?: string; modelAnswer?: string; keyPoints?: string[] }[] }
      | { text?: string; topic?: string; difficulty?: string; modelAnswer?: string; keyPoints?: string[] }[]
      | { text?: string; topic?: string; difficulty?: string; modelAnswer?: string; keyPoints?: string[] }[][]
    >(prompt, 0.7, 900);

    let raw: { text?: string; topic?: string; difficulty?: string; modelAnswer?: string; keyPoints?: string[] }[];
    if (Array.isArray(parsed)) {
      const first = parsed[0];
      if (first && Array.isArray((first as { questions?: unknown }).questions)) {
        raw = (first as { questions: typeof raw }).questions;
      } else {
        raw = parsed as typeof raw;
      }
    } else if (parsed && Array.isArray((parsed as { questions?: unknown }).questions)) {
      raw = (parsed as { questions: typeof raw }).questions;
    } else {
      raw = [];
    }

    if (raw.length === 0) {
      throw new Error('Ollama returned no questions. Please try again.');
    }

    const existing = new Set(previousQuestionTexts.map((t) => t.trim().toLowerCase()));
    const seen = new Set<string>();
    const questions: Question[] = [];

    for (const q of raw) {
      const text = q?.text?.trim();
      if (!text) continue;
      const key = text.toLowerCase();
      if (existing.has(key) || seen.has(key)) continue;
      seen.add(key);

      questions.push({
        id: `q_${Date.now()}_${questions.length}`,
        text,
        difficulty: (q.difficulty === 'easy' || q.difficulty === 'medium' || q.difficulty === 'hard'
          ? q.difficulty
          : dynamicDifficulty) as Difficulty,
        topic: q.topic || 'General',
        category: config.category,
        modelAnswer: q.modelAnswer || '',
        keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints.filter((k): k is string => typeof k === 'string') : [],
      });
    }

    if (questions.length === 0) {
      throw new Error('Ollama returned invalid questions. Please try again.');
    }

    const durationMs = Date.now() - startedAt;
    console.log(
      `[interview:generate-questions] complete model=${model} category=${config.category} language=${config.language || 'none'} topics=${JSON.stringify(config.topics)} difficulty=${config.difficulty} returned=${questions.length} durationMs=${durationMs}`
    );

    return questions;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate questions';
    console.error(
      `[interview:generate-questions] error model=${model} category=${config.category} language=${config.language || 'none'} topics=${JSON.stringify(config.topics)} difficulty=${config.difficulty} message=${message} durationMs=${Date.now() - startedAt}`
    );
    throw err;
  }
}

export async function evaluateAnswer(
  question: Question,
  userAnswer: string
): Promise<AnswerEvaluation> {
  const prompt = `Evaluate the candidate's spoken answer to this technical interview question.

Question: "${question.text}"

Model Answer: "${question.modelAnswer}"

Key Points Expected:
${question.keyPoints.map((kp) => `- ${kp}`).join('\n')}

Candidate's Spoken Answer: "${userAnswer}"

Return a JSON object:
{
  "isCorrect": boolean,
  "score": number (0-100, overall score),
  "technicalAccuracy": number (0-100),
  "completeness": number (0-100),
  "communication": number (0-100),
  "confidence": number (0-100),
  "feedback": "brief constructive feedback (2-3 sentences)",
  "modelAnswer": "the ideal answer for reference",
  "improvementTips": ["tip1", "tip2"],
  "missedPoints": ["point1", "point2"],
  "strengths": ["strength1", "strength2"]
}

If the answer is incorrect or incomplete:
- Explain why it falls short
- Show what important points were missed
- Suggest how to answer better in a real interview

If the answer is correct:
- Explain why it is correct
- Suggest how to make the answer even stronger (add technical depth, examples, edge cases)

Be encouraging but honest. Score accurately relative to what a good interviewer would expect.
Keep all text fields CONCISE.
Output ONLY the JSON object. Do not wrap it in markdown code fences or add any commentary.`;

  try {
    return await chatJson<AnswerEvaluation>(prompt, 0.5, 800, EVALUATION_SCHEMA);
  } catch (err) {
    console.error('Failed to evaluate answer:', err);
    throw err;
  }
}

export async function generateInterviewSummary(
  questions: { question: string; answer: string; score: number }[],
  extra: {
    questionsAnswered: number;
    questionsSkipped: number;
    avgResponseTime: number;
    totalDuration: number;
  }
): Promise<{
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  accuracyScore: number;
  strengths: string[];
  weaknesses: string[];
  topicsToImprove: string[];
  learningRecommendations: string[];
}> {
  const transcript = questions
    .map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.answer}\nScore: ${q.score}/100`)
    .join('\n\n');

  const prompt = `You are an interview coach. Generate a comprehensive report based on this interview transcript.

Session stats:
- Questions answered: ${extra.questionsAnswered}
- Questions skipped: ${extra.questionsSkipped}
- Average response time: ${extra.avgResponseTime.toFixed(1)} seconds
- Total interview duration: ${extra.totalDuration} seconds

${transcript}

Return a JSON object:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "confidenceScore": number (0-100),
  "accuracyScore": number (0-100),
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "topicsToImprove": ["topic1", "topic2"],
  "learningRecommendations": ["recommendation1", "recommendation2"]
}

Base the scores on actual answers. Be honest and accurate.
Keep all text fields CONCISE.
Output ONLY the JSON object. Do not wrap it in markdown code fences or add any commentary.`;

  try {
    return await chatJson<{
      overallScore: number;
      technicalScore: number;
      communicationScore: number;
      confidenceScore: number;
      accuracyScore: number;
      strengths: string[];
      weaknesses: string[];
      topicsToImprove: string[];
      learningRecommendations: string[];
    }>(prompt, 0.5, 800, SUMMARY_SCHEMA);
  } catch (err) {
    console.error('Failed to generate summary:', err);
    throw err;
  }
}
