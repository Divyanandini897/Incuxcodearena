import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
const { PrismaClient } = await import('../src/generated/prisma/client.ts');

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const count = await prisma.problem.count();
console.log('Problems count:', count);

const probs = await prisma.problem.findMany({ select: { leetcodeId: true, title: true, isPublished: true }, take: 3 });
console.log('Sample:', JSON.stringify(probs));

await prisma['$disconnect']();
