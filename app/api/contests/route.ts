import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  const contests = await prisma.contest.findMany({
    include: {
      problems: {
        include: { problem: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(contests)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, durationMins, maxPoints, startsAt, endsAt, createdBy, problemIds } = body

  if (!title || !durationMins || !createdBy) {
    return NextResponse.json({ error: 'Missing required fields: title, durationMins, createdBy' }, { status: 400 })
  }

  const contest = await prisma.contest.create({
    data: {
      title,
      description,
      durationMins,
      maxPoints: maxPoints ?? 0,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      createdBy,
      problems: problemIds?.length
        ? {
            create: problemIds.map((pid: string, i: number) => ({
              problemId: pid,
              sortOrder: i,
              points: 0,
            })),
          }
        : undefined,
    },
    include: {
      problems: {
        include: { problem: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  return NextResponse.json(contest, { status: 201 })
}
