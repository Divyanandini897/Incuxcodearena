import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

export async function GET(request: NextRequest) {
  const adminEmail = request.headers.get('x-admin-email') || ''
  if (!isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const submissions = await prisma.submission.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      problem: { select: { title: true, leetcodeId: true } },
    },
  })
  return NextResponse.json(submissions)
}
