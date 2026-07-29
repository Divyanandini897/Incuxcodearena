import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

const STATUS_MAP: Record<string, any> = {
  'Accepted': 'Accepted',
  'Wrong Answer': 'Wrong_Answer',
  'Compile Error': 'Compile_Error',
  'Runtime Error': 'Runtime_Error',
  'Time Limit Exceeded': 'Time_Limit_Exceeded',
}

const LANG_MAP: Record<string, any> = {
  'JavaScript': 'JavaScript',
  'Python': 'Python',
  'C++': 'Cpp',
  'Java': 'Java',
  'Go': 'Go',
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (err: any) {
      const msg = err?.message || '';
      if (i < retries && (msg.includes('closed the connection') || msg.includes('ECONNRESET') || msg.includes('pool'))) {
        await new Promise(r => setTimeout(r, 200 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { problemId, language, code, status, runtime, memory, testResults, userId } = body

  if (!problemId || !language || !code || !status || !userId) {
    return NextResponse.json({ error: 'Missing required fields: problemId, language, code, status, userId' }, { status: 400 })
  }

  const problem = await withRetry(() => prisma.problem.findUnique({ where: { leetcodeId: Number(problemId) } }))
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  const profile = await withRetry(() => prisma.profile.findUnique({ where: { id: userId } }))
  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const mappedStatus = STATUS_MAP[status]
  if (!mappedStatus) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
  }

  const mappedLanguage = LANG_MAP[language]
  if (!mappedLanguage) {
    return NextResponse.json({ error: `Invalid language: ${language}` }, { status: 400 })
  }

  const submission = await withRetry(() => prisma.submission.create({
    data: {
      userId,
      problemId: problem.id,
      language: mappedLanguage,
      code,
      status: mappedStatus,
      runtime: runtime ?? null,
      memory: memory ?? null,
      testResults: testResults ?? null,
    },
  }))

  const isAccepted = status === 'Accepted'
  await withRetry(() => prisma.userProblemProgress.upsert({
    where: { userId_problemId: { userId, problemId: problem.id } },
    update: {
      status: isAccepted ? 'solved' : 'in_progress',
      lastSubmissionId: submission.id,
      solvedAt: isAccepted ? new Date() : undefined,
    },
    create: {
      userId,
      problemId: problem.id,
      status: isAccepted ? 'solved' : 'in_progress',
      lastSubmissionId: submission.id,
      solvedAt: isAccepted ? new Date() : null,
    },
  }))

  return NextResponse.json({ submission }, { status: 201 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const problemId = searchParams.get('problemId')
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId query param' }, { status: 400 })
  }

  const where: any = { userId }
  if (problemId) {
    const problem = await withRetry(() => prisma.problem.findUnique({ where: { leetcodeId: Number(problemId) } }))
    if (!problem) {
      return NextResponse.json({ submissions: [] })
    }
    where.problemId = problem.id
  }

  const submissions = await withRetry(() => prisma.submission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  }))

  return NextResponse.json({ submissions })
}
