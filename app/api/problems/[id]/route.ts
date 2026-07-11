import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

const LANG_MAP: Record<string, string> = {
  Cpp: 'C++',
  Python: 'Python',
  Java: 'Java',
  JavaScript: 'JavaScript',
  Go: 'Go',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const leetcodeId = Number(id)
  if (isNaN(leetcodeId)) {
    return NextResponse.json({ error: 'Invalid problem id' }, { status: 400 })
  }

  const problem = await prisma.problem.findUnique({
    where: { leetcodeId },
    include: {
      problemTags: { include: { tag: true } },
      problemCompanies: { include: { company: true } },
      codeTemplates: true,
      examples: { orderBy: { sortOrder: 'asc' } },
      testCases: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: problem.leetcodeId,
    title: problem.title,
    difficulty: problem.difficulty,
    acceptance: problem.acceptance != null ? `${problem.acceptance}%` : null,
    category: problem.category,
    description: problem.description,
    examples: problem.examples.map((e) => ({
      input: e.input,
      output: e.output,
      explanation: e.explanation ?? undefined,
    })),
    starterCode: Object.fromEntries(
      problem.codeTemplates.map((t) => [LANG_MAP[t.language] ?? t.language, t.codeTemplate]),
    ),
    testCases: problem.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })),
    topics: problem.problemTags.map((pt) => pt.tag.name),
    companies: problem.problemCompanies.map((pc) => ({
      name: pc.company.name,
      frequency: pc.frequency,
    })),
  })
}
