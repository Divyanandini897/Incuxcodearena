import { InterviewConfig, Question, AnswerEvaluation, Difficulty } from './types';

const MODEL = 'gemma3:4b';
const DEFAULT_BASE_URL = 'http://localhost:11434';

const SYSTEM_PROMPT = `You are an expert technical interviewer conducting a live voice interview.
Ask clear, conversational questions as if speaking aloud.
Evaluate answers based on technical accuracy, completeness, and clarity.
Provide constructive feedback and model answers.
Keep responses concise — this is a spoken interview format.`;

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

async function chatJson<T>(prompt: string, temperature: number, maxTokens: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${getBaseUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        stream: false,
        format: 'json',
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const detail = body ? ` - ${body}` : '';
      throw new Error(`Ollama request failed (${res.status} ${res.statusText})${detail}`);
    }

    const data = await res.json();
    const text: string | undefined = data?.message?.content;
    if (!text) throw new Error('Empty response from Ollama');

    return JSON.parse(extractJson(text)) as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Ollama request timed out after 60s. Is Ollama running with the gemma3:4b model pulled?');
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
  const categoryLabel = config.category === 'programming-languages'
    ? config.language || 'Programming'
    : config.category;

  const topicList = config.topics.length > 0 ? config.topics.join(', ') : 'general topics';

  const languageInstruction = config.language
    ? `All questions MUST be specific to ${config.language} programming language. Do not ask about other languages.`
    : '';

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

  const prompt = `Generate ${count} technical interview questions at ${dynamicDifficulty} difficulty.

Category: ${categoryLabel}
Topics to cover: ${topicList}
${languageInstruction}
${excludeInstruction}
${previousPerformance}

For each question, return a JSON object with:
- "questions": an array of question objects, each with:
  - "text": a clear, conversational question (as if an interviewer is speaking aloud)
  - "topic": the topic name this question belongs to
  - "difficulty": "${dynamicDifficulty}"
  - "modelAnswer": a comprehensive model answer with technical depth
  - "keyPoints": 3-5 key points a good answer should cover

Make questions realistic for a ${dynamicDifficulty}-level technical interview.
Each question should be answerable verbally in 30-60 seconds.`;

  try {
    const parsed = await chatJson<{ questions?: { text?: string; topic?: string; difficulty?: string; modelAnswer?: string; keyPoints?: string[] }[] }>(
      prompt,
      0.7,
      2000
    );

    const questionsList = parsed.questions || parsed as unknown as { text?: string; topic?: string; difficulty?: string; modelAnswer?: string; keyPoints?: string[] }[];

    if (!Array.isArray(questionsList)) {
      throw new Error('Response is not an array');
    }

    return questionsList.map(
      (q: { text?: string; topic?: string; difficulty?: string; modelAnswer?: string; keyPoints?: string[] }, i: number) => ({
        id: `q_${Date.now()}_${i}`,
        text: q.text || 'No question text',
        difficulty: (q.difficulty || dynamicDifficulty) as Difficulty,
        topic: q.topic || 'General',
        category: config.category,
        modelAnswer: q.modelAnswer || '',
        keyPoints: q.keyPoints || [],
      })
    );
  } catch (err) {
    console.error('Failed to generate questions:', err);
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

Be encouraging but honest. Score accurately relative to what a good interviewer would expect.`;

  try {
    return await chatJson<AnswerEvaluation>(prompt, 0.5, 1500);
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

Base the scores on actual answers. Be honest and accurate.`;

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
    }>(prompt, 0.5, 1500);
  } catch (err) {
    console.error('Failed to generate summary:', err);
    throw err;
  }
}
