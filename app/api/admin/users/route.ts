import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

export async function GET(request: NextRequest) {
  const adminEmail = request.headers.get('x-admin-email') || ''
  if (!isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const users = await prisma.profile.findMany({
    select: { id: true, email: true, name: true, username: true, created_at: true },
    orderBy: { created_at: 'desc' },
  })
  return NextResponse.json(users)
}
