import 'dotenv/config';
import { prisma } from '@/src/lib/prisma';

async function main() {
  console.log('Cleaning up non-custom Basic problems...\n');

  const existing = await prisma.problem.findMany({
    where: {
      difficulty: 'Basic',
      isCustom: false,
    },
    select: { id: true, leetcodeId: true, title: true },
  });

  console.log(`Found ${existing.length} non-custom Basic problems to delete.\n`);

  if (existing.length === 0) {
    console.log('Nothing to clean up.');
    return;
  }

  for (const p of existing) {
    console.log(`  Deleting: [${p.leetcodeId}] ${p.title}`);
  }

  const result = await prisma.problem.deleteMany({
    where: {
      difficulty: 'Basic',
      isCustom: false,
    },
  });

  console.log(`\nDeleted ${result.count} Problem records (cascade removed related records).`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
