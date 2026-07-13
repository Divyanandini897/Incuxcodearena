import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const leetcodeId = Number(id)
  if (isNaN(leetcodeId)) {
    return NextResponse.json({ error: 'Invalid problem id' }, { status: 400 })
  }

  const body = await request.json()
  const { status: newStatus, userId } = body

  if (!userId || !newStatus) {
    return NextResponse.json({ error: 'Missing required fields: userId, status' }, { status: 400 })
  }

  const validStatuses = ['not_started', 'in_progress', 'solved']
  if (!validStatuses.includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status. Must be: not_started, in_progress, or solved' }, { status: 400 })
  }

  const problem = await prisma.problem.findUnique({ where: { leetcodeId } })
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  const progress = await prisma.userProblemProgress.upsert({
    where: { userId_problemId: { userId, problemId: problem.id } },
    update: {
      status: newStatus,
      solvedAt: newStatus === 'solved' ? new Date() : null,
    },
    create: {
      userId,
      problemId: problem.id,
      status: newStatus,
      solvedAt: newStatus === 'solved' ? new Date() : null,
    },
  })

  return NextResponse.json({ progress })
}
