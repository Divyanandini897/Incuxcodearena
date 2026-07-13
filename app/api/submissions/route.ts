import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { problemId, language, code, status, runtime, memory, testResults, userId } = body

  if (!problemId || !language || !code || !status || !userId) {
    return NextResponse.json({ error: 'Missing required fields: problemId, language, code, status, userId' }, { status: 400 })
  }

  const problem = await prisma.problem.findUnique({ where: { leetcodeId: Number(problemId) } })
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  const profile = await prisma.profile.findUnique({ where: { id: userId } })
  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const submission = await prisma.submission.create({
    data: {
      userId,
      problemId: problem.id,
      language,
      code,
      status,
      runtime: runtime ?? null,
      memory: memory ?? null,
      testResults: testResults ?? null,
    },
  })

  const isAccepted = status === 'Accepted'
  await prisma.userProblemProgress.upsert({
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
  })

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
    const problem = await prisma.problem.findUnique({ where: { leetcodeId: Number(problemId) } })
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }
    where.problemId = problem.id
  }

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ submissions })
}
