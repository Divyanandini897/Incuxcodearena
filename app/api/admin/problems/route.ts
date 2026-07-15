import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

export async function GET(request: NextRequest) {
  const adminEmail = request.headers.get('x-admin-email') || ''
  if (!isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const problems = await prisma.problem.findMany({
    select: { id: true, leetcodeId: true, title: true, difficulty: true, category: true, isPublished: true, acceptance: true, createdAt: true },
    orderBy: { leetcodeId: 'asc' },
  })
  return NextResponse.json(problems)
}
