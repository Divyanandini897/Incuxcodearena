import 'dotenv/config'
import { Pool } from 'pg'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { PROBLEMS_DATA, TOPIC_TAGS, COMPANIES_LIST } from '../src/data/data'

// DIRECT_URL uses a resolvable hostname (pooler) with the right user format
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!
const pool = new Pool({ connectionString })

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EXTRA_DATA: Record<number, {
  constraints: string[]
  hints: string[]
  followUps: string[]
}> = {
  1: {
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
    ],
    hints: [
      'Use a hash map to store elements you have already seen',
      'For each element, check if target - nums[i] exists in the map',
    ],
    followUps: [
      'Can you solve it with O(1) extra space complexity?',
    ],
  },
  3: {
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces',
    ],
    hints: [
      'Use a sliding window approach with two pointers',
      'Maintain a set of characters currently in the window',
      'Move the left pointer when you encounter a duplicate',
    ],
    followUps: [
      'Can you solve it in O(n) time and O(min(n, m)) space where m is the character set size?',
    ],
  },
  20: {
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only: \'()[]{}\'',
    ],
    hints: [
      'Use a stack to match opening and closing brackets',
      'Push opening brackets onto the stack, pop when you see a matching closing bracket',
      'If the stack is empty when you encounter a closing bracket, the string is invalid',
    ],
    followUps: [
      'Can you solve it for multiple bracket types without using a stack?',
    ],
  },
  11: {
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4',
    ],
    hints: [
      'Use two pointers starting from both ends of the array',
      'The area is limited by the shorter of the two lines',
      'Move the pointer pointing to the shorter line inward to find a larger area',
    ],
    followUps: [
      'What if you need to find the maximum area with at most one line removed?',
    ],
  },
  4: {
    constraints: [
      'nums1.length == m, nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6',
    ],
    hints: [
      'Use binary search on the smaller array to partition both arrays',
      'The median condition is that all left elements <= all right elements across both arrays',
      'The partition should split the combined array into two equal halves',
    ],
    followUps: [
      'Can you solve it with O(log(min(m, n))) time complexity?',
    ],
  },
}

async function main() {
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log('Seeding topics...')
  const topicNames = new Set<string>()
  for (const p of PROBLEMS_DATA) {
    for (const t of p.topics) topicNames.add(t)
  }
  for (const name of topicNames) {
    await prisma.topic.upsert({
      where: { name },
      update: {},
      create: { name, slug: toSlug(name) },
    })
  }

  console.log('Seeding tags...')
  for (const tag of TOPIC_TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: { name: tag.name, slug: toSlug(tag.name) },
    })
  }

  console.log('Seeding companies...')
  for (const company of COMPANIES_LIST) {
    await prisma.company.upsert({
      where: { name: company.name },
      update: {},
      create: { name: company.name, slug: toSlug(company.name) },
    })
  }

  console.log('Clearing extra data for re-seed...')
  await prisma.problemConstraint.deleteMany()
  await prisma.problemHint.deleteMany()
  await prisma.problemFollowUp.deleteMany()
  await prisma.problemTopic.deleteMany()

  console.log('Seeding problems...')
  for (const problem of PROBLEMS_DATA) {
    const acceptanceVal = parseFloat(problem.acceptance.replace('%', ''))
    const acceptance = isNaN(acceptanceVal) ? null : acceptanceVal

    // Ensure the problem exists (upsert won't re-create nested relations if it already exists)
    const created = await prisma.problem.upsert({
      where: { leetcodeId: problem.id },
      update: {},
      create: {
        leetcodeId: problem.id,
        title: problem.title,
        difficulty: problem.difficulty as any,
        acceptance: acceptance,
        description: problem.description,
        category: problem.category as any,
        examples: {
          create: problem.examples.map((ex, i) => ({
            input: ex.input,
            output: ex.output,
            explanation: ex.explanation || null,
            sortOrder: i,
          })),
        },
        codeTemplates: {
          create: Object.entries(problem.starterCode).map(([lang, code]) => ({
            language: lang === 'C++' ? 'Cpp' : lang as any,
            codeTemplate: code as string,
          })),
        },
        testCases: {
          create: problem.testcases.map((tc, i) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            sortOrder: i,
            isSample: true,
          })),
        },
        problemTags: {
          create: problem.topics.map((topicName) => ({
            tag: { connect: { name: topicName } },
          })),
        },
        problemCompanies: {
          create: problem.companies.map((c) => ({
            company: { connect: { name: c.name } },
            frequency: c.frequency,
          })),
        },
      },
    })

    const problemId = created.id
    const extra = EXTRA_DATA[problem.id]

    // Create extras separately since upsert update:{} doesn't re-create nested relations
    await prisma.problemConstraint.createMany({
      data: extra.constraints.map((text, i) => ({
        problemId,
        constraintText: text,
        sortOrder: i,
      })),
    })

    await prisma.problemHint.createMany({
      data: extra.hints.map((text, i) => ({
        problemId,
        hintText: text,
        sortOrder: i,
      })),
    })

    await prisma.problemFollowUp.createMany({
      data: extra.followUps.map((text, i) => ({
        problemId,
        followupText: text,
        sortOrder: i,
      })),
    })

    for (const topicName of problem.topics) {
      const topic = await prisma.topic.findUnique({ where: { name: topicName } })
      if (topic) {
        await prisma.problemTopic.upsert({
          where: { problemId_topicId: { problemId, topicId: topic.id } },
          update: {},
          create: { problemId, topicId: topic.id },
        })
      }
    }

    console.log(`  ✅ ${problem.title}`)
  }

  console.log('\nSeeding complete!')
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('Seed failed:', e.message)
  process.exit(1)
})
