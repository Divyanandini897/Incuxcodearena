import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { PROBLEMS_DATA } from '@/src/data/data'

export async function GET() {
  let created = 0
  let problemsCreated = 0

  for (const problem of PROBLEMS_DATA.slice(0, 50)) {
    let dbProblem = await prisma.problem.findUnique({ where: { leetcodeId: problem.id } })
    if (!dbProblem) {
      dbProblem = await prisma.problem.create({
        data: {
          leetcodeId: problem.id,
          title: problem.title,
          difficulty: problem.difficulty as any,
          acceptance: parseFloat(problem.acceptance) || null,
          description: problem.description,
          category: problem.category as any || 'Algorithms',
          isPublished: true,
        },
      })
      problemsCreated++
    }

    const existing = await prisma.testCase.count({ where: { problemId: dbProblem.id } })
    if (existing > 0) continue

    const examples = problem.examples || []
    for (let i = 0; i < examples.length; i++) {
      if (examples[i].input) {
        await prisma.testCase.create({
          data: {
            problemId: dbProblem.id,
            input: examples[i].input,
            expectedOutput: examples[i].output || 'N/A',
            isSample: true,
            sortOrder: i,
          },
        })
        created++
      }
    }

    const hiddenInputs = [
      JSON.stringify(examples.map(() => Math.floor(Math.random() * 100))),
      JSON.stringify(examples.map(() => Math.floor(Math.random() * 1000))),
    ]
    for (let i = 0; i < hiddenInputs.length; i++) {
      await prisma.testCase.create({
        data: {
          problemId: dbProblem.id,
          input: hiddenInputs[i],
          expectedOutput: 'N/A',
          isSample: false,
          sortOrder: examples.length + i,
        },
      })
      created++
    }
  }

  return NextResponse.json({ ok: true, problemsCreated, testCasesCreated: created })
}
