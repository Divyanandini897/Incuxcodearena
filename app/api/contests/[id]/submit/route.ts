import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await _request.json()
  const { userId, score } = body
  if (!userId || score === undefined) return NextResponse.json({ error: 'userId and score required' }, { status: 400 })

  const attempt = await prisma.contestAttempt.upsert({
    where: { contestId_userId: { contestId: id, userId } },
    update: { score, submittedAt: new Date() },
    create: { contestId: id, userId, score, submittedAt: new Date() },
  })
  return NextResponse.json(attempt)
}
