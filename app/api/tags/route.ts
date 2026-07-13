import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { problemTags: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    tags: tags.map((t) => ({
      name: t.name,
      count: t._count.problemTags,
    })),
  })
}
