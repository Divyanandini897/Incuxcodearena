/**
 * Script to create AI Interview tables in Supabase PostgreSQL.
 *
 * Usage:
 *   1. Get your Supabase database password:
 *      Go to https://supabase.com/dashboard → Project Settings → Database
 *      → Database password → Reveal / Reset
 *
 *   2. Run:
 *      set "DATABASE_URL=postgresql://postgres.dhztrmngzxlmmarrvllq:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
 *      node scripts/setup-interview-tables.js
 *
 *   Or with one line (replace YOUR_PASSWORD):
 *      DATABASE_URL="postgresql://postgres.dhztrmngzxlmmarrvllq:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" node scripts/setup-interview-tables.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('');
  console.error('How to get your Supabase database password:');
  console.error('  1. Go to https://supabase.com/dashboard');
  console.error('  2. Click your project (dhztrmngzxlmmarrvllq)');
  console.error('  3. Click Project Settings (gear icon) in the left sidebar');
  console.error('  4. Click "Database" in the left menu');
  console.error('  5. Under "Database password" click "Reveal" or "Reset password"');
  console.error('  6. Copy the password');
  console.error('');
  console.error('Then run this script with:');
  console.error('  set "DATABASE_URL=postgresql://postgres.dhztrmngzxlmmarrvllq:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"');
  console.error('  node scripts/setup-interview-tables.js');
  process.exit(1);
}

async function main() {
  console.log('Connecting to Supabase PostgreSQL...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  // Read the SQL from supabase-interview-schema.sql
  const sqlPath = path.resolve(__dirname, '..', 'supabase-interview-schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ SQL file not found at: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('Running interview table creation SQL...');

  let client;
  try {
    client = await pool.connect();
    await client.query(sql);
    console.log('✅ All interview tables created successfully!');
  } catch (err) {
    console.error('❌ Failed to create tables:', err.message);
    console.error('');
    console.error('Common issues:');
    console.error('  1. Wrong password — double-check the password in Supabase Dashboard');
    console.error('  2. IP address not allowed — Supabase may need Allow All IPs in Database settings');
    console.error('  3. Special characters in password — URL-encode them (% for special chars)');
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main();
