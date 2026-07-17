import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '@/src/lib/prisma';

const __dirname = dirname(fileURLToPath(import.meta.url));

type Entry = {
  leetcodeId: number;
  title: string;
  difficulty: string;
  isCustom: boolean;
  languageId: string;
  description: string;
  starterCode: Record<string, string>;
  testCases: Array<{ input: string; expectedOutput: string; isSample: boolean }>;
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: Array<{ constraintText: string }>;
};

const LANGUAGE_MAP: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'Cpp',
};

async function main() {
  const data: Entry[] = JSON.parse(
    readFileSync(join(__dirname, 'basic.json'), 'utf-8')
  );

  console.log(`Seeding ${data.length} Basic problem entries...\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of data) {
    try {
      const existing = await prisma.problem.findUnique({
        where: { leetcodeId: entry.leetcodeId },
      });

      const problem = await prisma.problem.upsert({
        where: { leetcodeId: entry.leetcodeId },
        create: {
          leetcodeId: entry.leetcodeId,
          title: entry.title,
          difficulty: 'Basic',
          description: entry.description,
          category: 'Algorithms',
          isCustom: true,
          isPublished: true,
        },
        update: {
          title: entry.title,
          difficulty: 'Basic',
          description: entry.description,
          category: 'Algorithms',
          isCustom: true,
          isPublished: true,
        },
      });

      if (existing) {
        updated++;
      } else {
        created++;
      }

      await prisma.$transaction([
        prisma.problemCodeTemplate.deleteMany({ where: { problemId: problem.id } }),
        prisma.testCase.deleteMany({ where: { problemId: problem.id } }),
        prisma.problemExample.deleteMany({ where: { problemId: problem.id } }),
        prisma.problemConstraint.deleteMany({ where: { problemId: problem.id } }),
      ]);

      const langKey = Object.keys(entry.starterCode)[0];
      const prismaLang = LANGUAGE_MAP[entry.languageId];

      await prisma.$transaction([
        prisma.problemCodeTemplate.create({
          data: {
            problemId: problem.id,
            language: prismaLang as any,
            codeTemplate: entry.starterCode[langKey],
          },
        }),
        ...entry.testCases.map((tc, i) =>
          prisma.testCase.create({
            data: {
              problemId: problem.id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isSample: tc.isSample,
              sortOrder: i,
            },
          })
        ),
        ...entry.examples.map((ex, i) =>
          prisma.problemExample.create({
            data: {
              problemId: problem.id,
              input: ex.input,
              output: ex.output,
              explanation: ex.explanation,
              sortOrder: i,
            },
          })
        ),
        ...entry.constraints.map((c, i) =>
          prisma.problemConstraint.create({
            data: {
              problemId: problem.id,
              constraintText: c.constraintText,
              sortOrder: i,
            },
          })
        ),
      ]);
    } catch (e: any) {
      const msg = `leetcodeId ${entry.leetcodeId}: ${e.message}`;
      errors.push(msg);
      console.error(`  ERROR: ${msg}`);
    }
  }

  console.log('\n--- Seed Summary ---');
  console.log(`  Total entries:  ${data.length}`);
  console.log(`  Newly created:  ${created}`);
  console.log(`  Updated:        ${updated}`);
  console.log(`  Errors:         ${errors.length}`);
  if (errors.length > 0) {
    console.log('\n  Failed entries:');
    errors.forEach((e) => console.log(`    - ${e}`));
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
