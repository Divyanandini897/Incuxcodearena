import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

export async function GET(request: NextRequest) {
  const adminEmail = request.headers.get('x-admin-email') || ''
  if (!isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const [totalUsers, totalProblems, totalContests, totalSubmissions, recentSubmissions] = await Promise.all([
    prisma.profile.count(),
    prisma.problem.count({ where: { isPublished: true } }),
    prisma.contest.count(),
    prisma.submission.count(),
    prisma.submission.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        problem: { select: { title: true, leetcodeId: true } },
      },
    }),
  ])

  const publishedContests = await prisma.contest.count({ where: { isPublished: true } })
  const draftContests = totalContests - publishedContests

  return NextResponse.json({
    totalUsers,
    totalProblems,
    totalContests,
    totalSubmissions,
    publishedContests,
    draftContests,
    recentSubmissions,
  })
}
