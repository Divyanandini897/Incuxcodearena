import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { PROBLEMS_DATA } from '@/components/data';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err);
      }
    }
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  const { problemId, code, language } = await req.json();

  const problem = PROBLEMS_DATA.find((p) => p.id === Number(problemId));
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `The user is working on the LeetCode problem: "${problem.title}".
Below is their current ${language || 'C++'} code:
\`\`\`${(language || 'C++').toLowerCase()}
${code}
\`\`\`

Give a subtle, helpful, and motivating hint (1-3 sentences) pointing them in the right direction. Do not write the full solution. Return as JSON with field "hint".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hint: { type: Type.STRING },
            },
            required: ['hint'],
          },
        },
      });

      const text = response.text?.trim() || '';
      try {
        const parsed = JSON.parse(text);
        return NextResponse.json(parsed);
      } catch (err) {
        console.error('Failed to parse Gemini hint response:', text);
      }
    } catch (err) {
      console.error('Gemini Hint failed:', err);
    }
  }

  let hint = 'Try starting with a brute-force approach first, and then analyze where the bottlenecks are to optimize it!';
  if (problem.id === 3) {
    hint = 'Think about using a sliding window. Can you maintain a left pointer and a right pointer, and update a hash set of characters currently in your window?';
  } else if (problem.id === 1) {
    hint = 'Can you store numbers you have already seen in a Hash Map to find their indices in O(1) time?';
  } else if (problem.id === 20) {
    hint = 'A stack is perfect here! Push opening brackets on the stack, and when you see a closing bracket, check if it matches the bracket on top.';
  }

  return NextResponse.json({ hint });
}
