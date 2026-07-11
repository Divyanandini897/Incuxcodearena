import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  const companies = await prisma.company.findMany({
    include: {
      problemCompanies: { select: { frequency: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    companies: companies.map((c) => ({
      name: c.name,
      frequency: c.problemCompanies.reduce((sum, pc) => sum + pc.frequency, 0),
    })),
  })
}
