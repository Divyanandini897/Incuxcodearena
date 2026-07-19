import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

const LANG_MAP: Record<string, string> = {
  Cpp: 'C++',
  Python: 'Python',
  Java: 'Java',
  JavaScript: 'JavaScript',
  Go: 'Go',
}

export async function GET(request: NextRequest) {
  // Admin can see all problems; students only see published ones
  const adminEmail = request.headers.get('x-admin-email') || ''
  const isAdmin = isAdminEmail(adminEmail)

  const problems = await prisma.problem.findMany({
    where: isAdmin ? {} : { isPublished: true },
    include: {
      problemTags: { include: { tag: true } },
      problemCompanies: { include: { company: true } },
      codeTemplates: true,
      examples: { orderBy: { sortOrder: 'asc' } },
      testCases: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { leetcodeId: 'asc' },
  })

  const result = problems.map((p) => ({
    id: p.leetcodeId,
    title: p.title,
    difficulty: p.difficulty,
    acceptance: p.acceptance != null ? `${p.acceptance}%` : null,
    category: p.category,
    description: p.description,
    examples: p.examples.map((e) => ({
      input: e.input,
      output: e.output,
      explanation: e.explanation ?? undefined,
    })),
    starterCode: Object.fromEntries(
      p.codeTemplates.map((t) => [LANG_MAP[t.language] ?? t.language, t.codeTemplate]),
    ),
    testCases: p.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })),
    topics: p.problemTags.map((pt) => pt.tag.name),
    companies: p.problemCompanies.map((pc) => ({
      name: pc.company.name,
      frequency: pc.frequency,
    })),
  }))

  return NextResponse.json({ problems: result })
}
