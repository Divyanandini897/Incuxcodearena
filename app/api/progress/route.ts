import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId query param' }, { status: 400 })
  }

  const progressList = await prisma.userProblemProgress.findMany({
    where: { userId },
    include: { problem: { select: { leetcodeId: true } } },
  })

  const progressMap: Record<number, string> = {}
  for (const p of progressList) {
    progressMap[p.problem.leetcodeId] = p.status
  }

  return NextResponse.json({ progress: progressMap })
}
