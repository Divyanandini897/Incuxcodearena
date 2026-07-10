const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'problems.csv');
const problemsFolderPath = path.join(__dirname, 'problems');
const dataFilePath = path.join(__dirname, 'data.ts');

// ─── Static metadata ────────────────────────────────────────────────────────

const TOPIC_TAGS = [
  { name: 'Array', count: 2197 },
  { name: 'String', count: 880 },
  { name: 'Hash Table', count: 825 },
  { name: 'Dynamic Programming', count: 666 },
  { name: 'Math', count: 542 },
  { name: 'Sorting', count: 421 },
  { name: 'Greedy', count: 395 },
  { name: 'Depth-First Search', count: 360 },
  { name: 'Binary Search', count: 310 },
  { name: 'Two Pointers', count: 298 },
  { name: 'Breadth-First Search', count: 245 },
  { name: 'Tree', count: 212 },
];

const COMPANIES_LIST = [
  { name: 'Google', frequency: 2318 },
  { name: 'Amazon', frequency: 1981 },
  { name: 'Meta', frequency: 1102 },
  { name: 'Microsoft', frequency: 844 },
  { name: 'Apple', frequency: 303 },
  { name: 'Deloitte', frequency: 124 },
  { name: 'Uber', frequency: 256 },
  { name: 'Netflix', frequency: 189 },
];

// ─── Starter code preserved for the 5 detailed problems ────────────────────
// We'll pull starter codes from the JSON files (cpp, python3, java, javascript, golang)

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build a zero-padded slug prefix, e.g. id=1 → "0001"
 */
function zeroPad(id) {
  return String(id).padStart(4, '0');
}

/**
 * Convert a problem title to a URL slug, e.g. "Two Sum" → "two-sum"
 */
function titleToSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip special chars
    .replace(/\s+/g, '-')           // spaces → dashes
    .replace(/-+/g, '-');           // collapse multiple dashes
}

/**
 * Find the JSON file for a given problem ID in the problems/ folder.
 * Strategy: look for a file starting with the zero-padded ID.
 */
function findProblemFile(id, allFiles) {
  const prefix = zeroPad(id) + '-';
  return allFiles.find(f => f.startsWith(prefix)) || null;
}

/**
 * Parse CSV line respecting quoted fields.
 */
function parseCSVLine(line) {
  const row = [];
  let insideQuote = false;
  let entry = '';
  for (const char of line) {
    if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === ',' && !insideQuote) {
      row.push(entry.trim());
      entry = '';
    } else {
      entry += char;
    }
  }
  row.push(entry.trim());
  return row;
}

/**
 * Parse problems.csv → array of { id, title, acceptance, difficulty }
 */
function parseCSV(content) {
  const lines = content.split('\n');
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const row = parseCSVLine(line);
    if (row.length < 4) continue;
    const id = parseInt(row[0], 10);
    if (isNaN(id)) continue;
    results.push({ id, title: row[1].trim(), acceptance: row[2].trim(), difficulty: row[3].trim() });
  }
  return results;
}

/**
 * Map code_snippets keys from JSON to our display language names.
 */
function buildStarterCode(snippets) {
  if (!snippets) return {
    'C++': '// Write your solution here',
    'Python': '# Write your solution here',
    'Java': '// Write your solution here',
    'JavaScript': '// Write your solution here',
    'Go': '// Write your solution here',
  };
  return {
    'C++':        snippets['cpp']        || snippets['c']  || '// Write your solution here',
    'Python':     snippets['python3']    || snippets['python'] || '# Write your solution here',
    'Java':       snippets['java']       || '// Write your solution here',
    'JavaScript': snippets['javascript'] || '// Write your solution here',
    'Go':         snippets['golang']     || '// Write your solution here',
  };
}

/**
 * Convert JSON examples array → our internal Example[] shape.
 * JSON format: [{ example_num, example_text: "Input: ...\nOutput: ...\nExplanation: ..." }]
 */
function parseExamples(jsonExamples) {
  if (!jsonExamples || jsonExamples.length === 0) return [];
  return jsonExamples.map(ex => {
    const text = ex.example_text || '';
    const lines = text.split('\n');
    let input = '', output = '', explanation = '';
    for (const line of lines) {
      if (line.startsWith('Input:'))       input       = line.replace('Input:', '').trim();
      else if (line.startsWith('Output:')) output      = line.replace('Output:', '').trim();
      else if (line.startsWith('Explanation:')) explanation = line.replace('Explanation:', '').trim();
    }
    const example = { input, output };
    if (explanation) example.explanation = explanation;
    return example;
  });
}

/**
 * Build a clean description from JSON fields:
 * description + constraints block.
 */
function buildDescription(jsonData) {
  let desc = (jsonData.description || '').trim();

  if (jsonData.constraints && jsonData.constraints.length > 0) {
    desc += '\n\nConstraints:\n' + jsonData.constraints.map(c => `- ${c}`).join('\n');
  }
  return desc || 'Problem details coming soon!';
}

/**
 * Determine category from topics array.
 * Matches LeetCode's four top-level categories:
 *   Algorithms | Database | Shell | Concurrency
 */
function categoryFromTopics(topics) {
  if (!topics || topics.length === 0) return 'Algorithms';

  const normalized = topics.map(t => t.toLowerCase());

  // Database: SQL / MySQL / PostgreSQL / Pandas etc.
  const dbKeywords = ['database', 'sql', 'mysql', 'postgresql', 'pandas', 'relational'];
  if (normalized.some(t => dbKeywords.some(k => t.includes(k)))) return 'Database';

  // Shell: Bash / Shell scripting
  const shellKeywords = ['shell', 'bash', 'scripting', 'command line', 'linux'];
  if (normalized.some(t => shellKeywords.some(k => t.includes(k)))) return 'Shell';

  // Concurrency: threading / async / parallelism
  const concurrencyKeywords = ['concurrency', 'thread', 'multithreading', 'mutex', 'semaphore', 'async', 'parallel', 'lock', 'synchroniz'];
  if (normalized.some(t => concurrencyKeywords.some(k => t.includes(k)))) return 'Concurrency';

  return 'Algorithms';
}

/**
 * Fallback keyword-based topic assignment when JSON has no topics.
 */
function getTopicsFromTitle(title) {
  const lc = title.toLowerCase();
  const matched = [];
  if (lc.includes('array') || lc.includes('matrix') || lc.includes('grid')) matched.push('Array');
  if (lc.includes('string') || lc.includes('word') || lc.includes('substring') || lc.includes('palindrome') || lc.includes('anagram')) matched.push('String');
  if (lc.includes('tree') || lc.includes('bst') || lc.includes('binary tree')) matched.push('Tree');
  if (lc.includes('binary search')) matched.push('Binary Search');
  if (lc.includes('dfs') || lc.includes('depth')) matched.push('Depth-First Search');
  if (lc.includes('bfs') || lc.includes('breadth')) matched.push('Breadth-First Search');
  if (lc.includes('hash') || lc.includes('map') || lc.includes('duplicate')) matched.push('Hash Table');
  if (lc.includes('sort')) matched.push('Sorting');
  if (lc.includes('greedy')) matched.push('Greedy');
  if (lc.includes('sum') || lc.includes('math') || lc.includes('number') || lc.includes('digit') || lc.includes('integer') || lc.includes('roman')) matched.push('Math');
  if (lc.includes('path') || lc.includes('ways') || lc.includes('subsequence')) matched.push('Dynamic Programming');
  return matched.length > 0 ? matched : ['General'];
}

// ─── Main ────────────────────────────────────────────────────────────────────

function run() {
  console.log('📂 Reading problems.csv...');
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const csvProblems = parseCSV(csvContent);
  console.log(`   → Parsed ${csvProblems.length} rows from CSV.`);

  console.log('📂 Scanning problems/ folder...');
  const allFiles = fs.readdirSync(problemsFolderPath).filter(f => f.endsWith('.json'));
  console.log(`   → Found ${allFiles.length} JSON files.`);

  // Build a quick lookup: id → filename
  const fileById = new Map();
  for (const filename of allFiles) {
    const idMatch = filename.match(/^(\d+)-/);
    if (idMatch) {
      fileById.set(parseInt(idMatch[1], 10), filename);
    }
  }

  let matched = 0;
  let fallback = 0;
  const finalProblems = [];

  for (const csvRow of csvProblems) {
    const { id, title, acceptance, difficulty } = csvRow;
    const filename = fileById.get(id);

    if (filename) {
      matched++;
      const filepath = path.join(problemsFolderPath, filename);
      let jsonData = {};
      try {
        jsonData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      } catch (e) {
        console.warn(`   ⚠️  Failed to parse ${filename}: ${e.message}`);
      }

      const topics = (jsonData.topics && jsonData.topics.length > 0)
        ? jsonData.topics
        : getTopicsFromTitle(title);

      finalProblems.push({
        id,
        title: jsonData.title || title,
        difficulty: jsonData.difficulty || difficulty,
        acceptance,
        solved: false,
        category: categoryFromTopics(topics),
        topics,
        companies: [],
        description: buildDescription(jsonData),
        examples: parseExamples(jsonData.examples),
        starterCode: buildStarterCode(jsonData.code_snippets),
        testcases: [],
      });
    } else {
      // No JSON file found — create a minimal stub
      fallback++;
      finalProblems.push({
        id,
        title,
        difficulty,
        acceptance,
        solved: false,
        category: 'Algorithms',
        topics: getTopicsFromTitle(title),
        companies: [],
        description: 'Problem details coming soon!',
        examples: [],
        starterCode: {
          'C++':        '// Write your solution here',
          'Python':     '# Write your solution here',
          'Java':       '// Write your solution here',
          'JavaScript': '// Write your solution here',
          'Go':         '// Write your solution here',
        },
        testcases: [],
      });
    }
  }

  // Sort by problem ID
  finalProblems.sort((a, b) => a.id - b.id);

  console.log(`\n✅ Results:`);
  console.log(`   → ${matched} problems matched with JSON files.`);
  console.log(`   → ${fallback} problems used stub (no JSON file found).`);
  console.log(`   → ${finalProblems.length} total problems.`);

  // Generate the TypeScript output
  const outputCode = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AUTO-GENERATED by src/data/convert.js
 * Do not edit manually — run \`node src/data/convert.js\` to regenerate.
 */

import { Problem } from '../types';

export const TOPIC_TAGS = ${JSON.stringify(TOPIC_TAGS, null, 2)};

export const COMPANIES_LIST = ${JSON.stringify(COMPANIES_LIST, null, 2)};

export const PROBLEMS_DATA: Problem[] = ${JSON.stringify(finalProblems, null, 2)};
`;

  fs.writeFileSync(dataFilePath, outputCode, 'utf-8');
  console.log(`\n💾 Successfully wrote data.ts (${(outputCode.length / 1024).toFixed(0)} KB).`);
}

run();
