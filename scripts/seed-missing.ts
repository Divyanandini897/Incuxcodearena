import { config } from 'dotenv'
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DIRECT_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL!

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`)
  return res.json()
}

async function getExistingIds(): Promise<Set<number>> {
  const data = await fetchJson(
    `${SUPABASE_URL}/rest/v1/problems?select=leetcode_id&limit=2000`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  )
  return new Set<number>(data.map((r: any) => r.leetcode_id))
}

async function main() {
  // Dynamic import after env is loaded
  const { PROBLEMS_DATA } = await import('../src/data/data')

  const existingIds = await getExistingIds()
  console.log(`Existing problems in DB: ${existingIds.size}`)

  const missing = PROBLEMS_DATA.filter(p => !existingIds.has(p.id))
  console.log(`Missing problems to seed: ${missing.length}`)

  if (missing.length === 0) {
    console.log('All problems already seeded!')
    return
  }

  const { Pool } = await import('pg')
  const pool = new Pool({ connectionString: DIRECT_URL, max: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 })
  pool.on('error', () => {})

  let seeded = 0
  let failed = 0
  for (const problem of missing) {
    const acceptanceVal = parseFloat(problem.acceptance.replace('%', ''))
    const acceptance = isNaN(acceptanceVal) ? null : acceptanceVal

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const probResult = await client.query(
        `INSERT INTO problems (id, leetcode_id, title, difficulty, acceptance, description, category, is_custom, is_published, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, false, false, now(), now())
         ON CONFLICT (leetcode_id) DO NOTHING
         RETURNING id`,
        [problem.id, problem.title, problem.difficulty, acceptance, problem.description, problem.category || 'Algorithms']
      )

      if (probResult.rowCount === 0) {
        await client.query('ROLLBACK')
        continue
      }

      const problemId = probResult.rows[0].id

      if (problem.testcases?.length > 0) {
        for (let i = 0; i < problem.testcases.length; i++) {
          const tc = problem.testcases[i]
          await client.query(
            `INSERT INTO test_cases (id, problem_id, input, expected_output, sort_order, is_sample)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, true)`,
            [problemId, tc.input, tc.expectedOutput, i]
          )
        }
      }

      if (problem.examples?.length > 0) {
        for (let i = 0; i < problem.examples.length; i++) {
          const ex = problem.examples[i]
          await client.query(
            `INSERT INTO problem_examples (id, problem_id, input, output, explanation, sort_order)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
            [problemId, ex.input, ex.output, ex.explanation || null, i]
          )
        }
      }

      if (problem.starterCode) {
        const langMap: Record<string, string> = { 'C++': 'C++', 'Python': 'Python', 'Java': 'Java', 'JavaScript': 'JavaScript', 'Go': 'Go' }
        for (const [lang, code] of Object.entries(problem.starterCode)) {
          const dbLang = langMap[lang]
          if (!dbLang) continue
          await client.query(
            `INSERT INTO problem_code_templates (id, problem_id, language, code_template, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2::supported_language, $3, now(), now())`,
            [problemId, dbLang, code]
          )
        }
      }

      await client.query('COMMIT')
      seeded++
      if (seeded % 50 === 0) {
        console.log(`  Seeded ${seeded}/${missing.length} (last: ${problem.title})`)
      }
    } catch (err: any) {
      await client.query('ROLLBACK')
      failed++
      if (failed <= 3) console.error(`  ❌ ${problem.title}: ${err.message}`)
    } finally {
      client.release()
    }
  }

  console.log(`\nDone! Seeded ${seeded}/${missing.length} (${failed} failed)`)
  await pool.end()
}

main().catch(async (e) => {
  console.error('Seed failed:', e.message)
  process.exit(1)
})
