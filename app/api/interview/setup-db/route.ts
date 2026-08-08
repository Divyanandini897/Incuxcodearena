import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import fs from 'fs';
import path from 'path';

const REQUIRED_TABLES = [
  'ai_interview_sessions',
  'ai_interview_questions',
  'ai_interview_reports',
  'ai_interview_answers',
];

async function checkInterviewTables(): Promise<{ missing: string[]; allExist: boolean }> {
  const missing: string[] = [];

  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .select('id')
        .limit(1);

      if (error && (error.code === 'PGRST205' || (error.message && error.message.includes('Could not find the table')))) {
        missing.push(table);
      }
    } catch {
      missing.push(table);
    }
  }

  return { missing, allExist: missing.length === 0 };
}

export async function GET() {
  try {
    const { missing, allExist } = await checkInterviewTables();

    return NextResponse.json({
      tables: Object.fromEntries(
        REQUIRED_TABLES.map((t) => [t, missing.includes(t) ? 'missing' : 'exists'])
      ),
      allTablesExist: allExist,
      setupRequired: !allExist,
      message: allExist
        ? 'All interview tables exist. The interview module is ready to use.'
        : 'Interview tables are missing.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Setup check error:', err);
    return NextResponse.json({ error: message, allTablesExist: false }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { allExist } = await checkInterviewTables();

    if (allExist) {
      return NextResponse.json({ message: 'Tables already exist. No setup needed.' });
    }

    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL is not configured. See .env.example for setup instructions.',
        allTablesExist: false,
      }, { status: 500 });
    }

    const sqlPath = path.resolve(process.cwd(), 'supabase-interview-schema.sql');
    if (!fs.existsSync(sqlPath)) {
      return NextResponse.json({ error: 'Schema file not found: supabase-interview-schema.sql' }, { status: 500 });
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    const { Pool } = await import('pg');

    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await pool.query(sql);
    } finally {
      await pool.end();
    }

    const { missing } = await checkInterviewTables();
    if (missing.length > 0) {
      return NextResponse.json({
        error: `Some tables could not be created: ${missing.join(', ')}`,
        allTablesExist: false,
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'All interview tables created successfully!' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Setup POST error:', err);
    return NextResponse.json({ error: message, allTablesExist: false }, { status: 500 });
  }
}
