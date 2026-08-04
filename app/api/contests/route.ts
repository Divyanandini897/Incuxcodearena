import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get('admin') === 'true'

  // Only admins can see all contests (including drafts)
  if (admin) {
    const adminEmail = request.headers.get('x-admin-email') || ''
    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
  }

  const where = admin ? {} : { isPublished: true }
  const contests = await prisma.contest.findMany({
    where,
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
  const { title, description, durationMins, maxPoints, maxViolations, startsAt, endsAt, createdBy, problemIds, reminderMinutes } = body

  const adminEmail = request.headers.get('x-admin-email') || ''
  if (!isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: 'Only admins can create contests' }, { status: 403 })
  }

  if (!title || !durationMins || !createdBy) {
    return NextResponse.json({ error: 'Missing required fields: title, durationMins, createdBy' }, { status: 400 })
  }

  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 })
  }

  // Ensure the creator profile exists
  const creator = await prisma.profile.findUnique({ where: { id: createdBy } })
  if (!creator) {
    return NextResponse.json({ error: 'Creator profile not found. Sync your profile first.' }, { status: 400 })
  }

  const contest = await prisma.contest.create({
    data: {
      title,
      description,
      durationMins,
      maxPoints: maxPoints ?? 0,
      maxViolations: maxViolations ?? undefined,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      reminderMinutes: reminderMinutes ?? 10,
      createdBy,
      problems: problemIds?.length
        ? {
            create: problemIds.map((pid: string, i: number) => ({
              problemId: pid,
              sortOrder: i,
              points: Math.floor((maxPoints ?? 0) / problemIds.length),
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
