import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { PROBLEMS_DATA } from '@/src/data/data';
import { cacheKey, cacheGet, cacheSet } from './cache';

const execFileAsync = promisify(execFile);
const TIMEOUT_MS = 5000;

// Judge0 configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN || '';
const USE_JUDGE0 = true; // always try Judge0 first

const JUDGE0_LANG_IDS: Record<string, number> = {
  'JavaScript': 63,
  'Python': 71,
  'C++': 54,
  'Java': 62,
  'Go': 60,
};

interface ExtractedFn {
  name: string;
  isClassMethod: boolean;
  paramTypes: string[];
}

function extractFunction(code: string, language: string): ExtractedFn | null {
  let name: string | null = null;
  let isClassMethod = false;

  if (language === 'JavaScript') {
    const varMatch = code.match(/var\s+(\w+)\s*=\s*function\s*(?:\w+\s*)?\(/);
    if (varMatch) name = varMatch[1];
    else {
      const constMatch = code.match(/(?:const|let)\s+(\w+)\s*=\s*\(/);
      if (constMatch) name = constMatch[1];
      else {
        const funcMatch = code.match(/function\s+(\w+)\s*\(/);
        if (funcMatch) name = funcMatch[1];
      }
    }
  }

  if (language === 'Python') {
    isClassMethod = /^class\s+\w+/m.test(code);
    const defMatch = code.match(/def\s+(\w+)\s*\(/);
    if (defMatch) name = defMatch[1];
  }

  if (language === 'C++') {
    isClassMethod = /\bclass\s+Solution\b/.test(code);
    const lines = code.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^\w+(?:<[^>]*>)?\s+(\w+)\s*\(/);
      if (match && !['if', 'for', 'while', 'switch', 'catch'].includes(match[1])) {
        name = match[1];
        break;
      }
    }
  }

  if (language === 'Java') {
    isClassMethod = /\bclass\s+Solution\b/.test(code);
    const methodMatch = code.match(/(?:public\s+)?(\w+(?:\[\])?(?:<[^>]*>)?)\s+(\w+)\s*\(/);
    if (methodMatch && methodMatch[2] !== 'main' && methodMatch[2] !== 'Solution') {
      name = methodMatch[2];
    }
  }

  if (language === 'Go') {
    const funcMatch = code.match(/func\s+(\w+)\s*\(/);
    if (funcMatch && funcMatch[1] !== 'main') name = funcMatch[1];
  }

  if (!name) return null;

  let paramTypes: string[] = [];
  const sig = extractSignature(code, language, name);
  if (sig) paramTypes = extractParamTypes(sig);

  return { name, isClassMethod, paramTypes };
}

function extractSignature(code: string, language: string, fnName: string): string | null {
  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (language === 'Go') {
      if (trimmed.startsWith('func') && trimmed.includes(fnName) && trimmed.includes('(')) return trimmed;
    } else {
      if (trimmed.includes(fnName) && trimmed.includes('(') && trimmed.includes(')')) return trimmed;
    }
  }
  return null;
}

function toCanonicalType(raw: string): string {
  const s = raw.replace(/&/g, '').replace(/\s+/g, ' ').trim();
  const lower = s.toLowerCase();
  if (lower.includes('vector') && lower.includes('int')) return 'vector<int>';
  if (lower.includes('int') && lower.includes('[')) return 'int[]';
  if (lower === 'int' || lower === 'integer') return 'int';
  if (lower === 'double' || lower === 'float') return 'double';
  if (lower === 'string' || lower === 'str' || s === 'String') return 'string';
  if (lower === 'bool' || lower === 'boolean') return 'boolean';
  if (lower.startsWith('vector<') || (lower.includes('[') && lower.includes(']'))) return 'vector<int>';
  return 'string';
}

function extractParamTypes(sig: string): string[] {
  const paramsMatch = sig.match(/\(([^)]*)\)/);
  if (!paramsMatch) return [];
  const paramsStr = paramsMatch[1].trim();
  if (!paramsStr) return [];

  const rawTypes: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of paramsStr) {
    if (ch === '<' || ch === '(') depth++;
    else if (ch === '>' || ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      rawTypes.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) rawTypes.push(current.trim());

  return rawTypes.map((t) => {
    const clean = t.replace(/[&*]/g, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    return toCanonicalType(parts[0] || 'string');
  });
}

function jsonToLiteral(jsonStr: string, type: string, language: string): string {
  const val = JSON.parse(jsonStr);
  if (type === 'vector<int>' || type === 'int[]') {
    const arr = val as number[];
    if (language === 'C++') return `{${arr.join(',')}}`;
    if (language === 'Java') return `new int[]{${arr.join(',')}}`;
    if (language === 'Go') return `[]int{${arr.join(',')}}`;
  }
  if (type === 'int') return String(val);
  if (type === 'double') return String(val);
  if (type === 'boolean') return val ? 'true' : 'false';
  if (type === 'string') return `"${(val as string).replace(/"/g, '\\"')}"`;
  return jsonStr;
}

// --------------- WRAPPER CODE GENERATION ---------------

function buildWrapperCode(code: string, language: string, fn: ExtractedFn, inputStr: string): string {
  const lines = JSON.stringify(inputStr);

  if (language === 'Python') {
    const call = fn.isClassMethod
      ? `Solution().${fn.name}(*__args)`
      : `${fn.name}(*__args)`;
    return `${code}
# --- Judge harness ---
import json, sys
__judge_input = ${lines}
__lines = [l for l in __judge_input.split('\\n') if l.strip()]
__args = [json.loads(l) for l in __lines]
__result = ${call}
print(json.dumps(__result, separators=(',', ':')))
`;
  }

  if (language === 'JavaScript') {
    return `${code}
// --- Judge harness ---
const __judgeInput = ${lines};
const __lines = __judgeInput.split('\\n').filter(l => l.trim() !== '');
const __args = __lines.map(l => JSON.parse(l));
const __result = ${fn.name}(...__args);
process.stdout.write(JSON.stringify(__result));
`;
  }

  if (language === 'C++') {
    const args = inputStr.split('\n').filter(l => l.trim());
    const typedArgs = args.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return jsonToLiteral(a, t, 'C++');
    });

    return `#include <bits/stdc++.h>
using namespace std;

${code}
string __resultStr(const vector<int>& v) {
  string r = "[";
  for (size_t i = 0; i < v.size(); i++) {
    if (i) r += ",";
    r += to_string(v[i]);
  }
  return r + "]";
}
string __resultStr(int x) { return to_string(x); }
string __resultStr(double x) { ostringstream oss; oss << x; return oss.str(); }
string __resultStr(bool x) { return x ? "true" : "false"; }
string __resultStr(const string& s) { return s; }

int main() {
  ${fn.isClassMethod ? 'Solution __sol;' : ''}
  cout << __resultStr(${fn.isClassMethod ? '__sol.' : ''}${fn.name}(${typedArgs.join(', ')})) << endl;
  return 0;
}
`;
  }

  if (language === 'Java') {
    const args = inputStr.split('\n').filter(l => l.trim());
    const typedArgs = args.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return jsonToLiteral(a, t, 'Java');
    });

    return `import java.util.*;
import java.util.stream.*;

public class Main {
${code}

  static String __resultStr(int[] v) {
    return Arrays.stream(v).mapToObj(String::valueOf).collect(Collectors.joining(",", "[", "]"));
  }
  static String __resultStr(int x) { return String.valueOf(x); }
  static String __resultStr(double x) { return String.valueOf(x); }
  static String __resultStr(boolean x) { return String.valueOf(x); }
  static String __resultStr(String s) { return s; }

  public static void main(String[] args) {
    ${fn.isClassMethod ? 'Solution __sol = new Solution();' : ''}
    System.out.print(__resultStr(${fn.isClassMethod ? '__sol.' : 'new Main().'}${fn.name}(${typedArgs.join(', ')})));
  }
}
`;
  }

  // Go
  const args = inputStr.split('\n').filter(l => l.trim());
  const typedArgs = args.map((a, i) => {
    const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
    return jsonToLiteral(a, t, 'Go');
  });

  return `package main
import "fmt"
import "strconv"
${code}

func __resultStr(v interface{}) string {
  switch x := v.(type) {
  case []int:
    s := "["
    for i, n := range x {
      if i > 0 { s += "," }
      s += strconv.Itoa(n)
    }
    return s + "]"
  case int: return strconv.Itoa(x)
  case float64: return fmt.Sprint(x)
  case bool: return fmt.Sprintf("%v", x)
  case string: return x
  default: return fmt.Sprint(x)
  }
}

func main() {
  fmt.Print(__resultStr(${fn.name}(${typedArgs.join(', ')})))
}
`;
}

// --------------- LOCAL COMPILER (fallback for JS/Python) ---------------

async function runLocal(code: string, language: string, fn: ExtractedFn, inputStr: string): Promise<{
  actual: string; stderr: string; runtimeMs: number
}> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'judge-'));
  const ext = language === 'JavaScript' ? '.js' : '.py';
  const srcFile = join(tmpDir, `solution${ext}`);
  const wrapped = buildWrapperCode(code, language, fn, inputStr);
  await writeFile(srcFile, wrapped, 'utf-8');

  const command = language === 'JavaScript' ? process.execPath : 'python';
  const start = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync(command, [srcFile], {
      timeout: TIMEOUT_MS, cwd: tmpDir, maxBuffer: 1024 * 1024,
    });
    const runtimeMs = Date.now() - start;
    await unlink(srcFile).catch(() => {});
    const lines = stdout.split('\n').filter((l: string) => l.trim());
    const actual = lines.length > 0 ? lines[lines.length - 1] : '(no output)';
    const debugOutput = lines.length > 1 ? lines.slice(0, -1).join('\n') : '';
    return { actual, stderr: debugOutput || stderr, runtimeMs };
  } catch (err: any) {
    const runtimeMs = Date.now() - start;
    await unlink(srcFile).catch(() => {});
    if (err.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      throw { type: 'Time Limit Exceeded', message: 'Output exceeded maximum buffer size' };
    }
    if (err.killed || err.signal) {
      throw { type: 'Time Limit Exceeded', message: 'Execution timed out' };
    }
    throw { type: 'Runtime Error', message: err.stderr || err.message };
  }
}

// --------------- JUDGE0 COMPILER ---------------

async function runViaJudge0(code: string, language: string): Promise<{
  stdout: string; stderr: string; compileOutput: string; statusId: number; time: string; memory: string;
}> {
  const langId = JUDGE0_LANG_IDS[language];
  if (!langId) throw { type: 'Compile Error', message: `No Judge0 language ID for "${language}"` };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (JUDGE0_AUTH_TOKEN) headers['X-Auth-Token'] = JUDGE0_AUTH_TOKEN;

  const response = await fetch(`${JUDGE0_API_URL}/submissions?wait=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source_code: code,
      language_id: langId,
      stdin: '',
      cpu_time_limit: 5,
      memory_limit: 256000,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw { type: 'Compile Error', message: `Judge0 API error (${response.status}): ${text}` };
  }

  const data = await response.json();
  return {
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    compileOutput: data.compile_output || '',
    statusId: data.status?.id || 0,
    time: data.time || '0',
    memory: data.memory || '0',
  };
}

function judge0StatusToResult(statusId: number, stdout: string, stderr: string, compileOutput: string): {
  status: 'Accepted' | 'Wrong Answer' | 'Compile Error' | 'Runtime Error' | 'Time Limit Exceeded';
  error?: string;
  actual: string;
} {
  // Judge0 status IDs:
  // 3 = Accepted (output matches expected)
  // 4 = Wrong Answer (output mismatch)
  // 5 = Time Limit Exceeded
  // 6 = Compilation Error
  // 7-12 = Runtime Error (SIGSEGV, SIGXFSZ, etc)
  // 13 = Internal Error

  const lines = stdout.split('\n').filter(l => l.trim());
  const actual = lines.length > 0 ? lines[lines.length - 1] : '(no output)';

  if (statusId === 6) {
    return { status: 'Compile Error', error: compileOutput || stderr || 'Compilation failed', actual };
  }
  if (statusId === 5) {
    return { status: 'Time Limit Exceeded', error: 'Time limit exceeded', actual };
  }
  if (statusId === 4) {
    return { status: 'Wrong Answer', actual };
  }
  if (statusId >= 7) {
    return { status: 'Runtime Error', error: stderr || compileOutput || 'Runtime error', actual };
  }
  if (statusId === 3) {
    return { status: 'Accepted', actual };
  }

  return { status: 'Runtime Error', error: `Unknown status: ${statusId}`, actual };
}

// --------------- EXAMPLES → TESTCASES ---------------

function parseExampleInput(s: string): string[] {
  s = s.replace(/^Input:\s*/i, '').trim();
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i <= s.length; i++) {
    if (i === s.length || (s[i] === ',' && depth === 0)) {
      const part = s.slice(start, i).trim();
      const eqIdx = part.lastIndexOf('=');
      if (eqIdx >= 0) parts.push(part.slice(eqIdx + 1).trim());
      start = i + 1;
      continue;
    }
    if (s[i] === '[' || s[i] === '{' || s[i] === '(') depth++;
    else if (s[i] === ']' || s[i] === '}' || s[i] === ')') depth--;
  }
  return parts;
}

function getTestcases(problem: typeof PROBLEMS_DATA[0]): { input: string; expectedOutput: string }[] {
  if (problem.testcases.length > 0) return problem.testcases;
  return problem.examples.map((ex) => ({
    input: parseExampleInput(ex.input).join('\n'),
    expectedOutput: ex.output,
  }));
}

// --------------- SHARED ---------------

function normalizeOutput(output: string): string {
  return output.replace(/\s+/g, '');
}

export async function POST(req: NextRequest) {
  const { problemId, language, code, action, customInput } = await req.json();

  const problem = PROBLEMS_DATA.find((p) => p.id === Number(problemId));
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  if (!JUDGE0_LANG_IDS[language]) {
    return NextResponse.json({
      status: 'Compile Error',
      compileError: `"${language}" is not supported. Supported: ${Object.keys(JUDGE0_LANG_IDS).join(', ')}`,
      runtime: '0ms', memory: '0MB', testResults: [],
    });
  }

  const testcasesToRun = customInput
    ? [{ input: customInput, expectedOutput: 'N/A' }]
    : getTestcases(problem);

  const fn = extractFunction(code, language);
  if (!fn) {
    return NextResponse.json({
      status: 'Compile Error',
      compileError: 'Could not detect function signature.',
      runtime: '0ms', memory: '0MB',
      testResults: testcasesToRun.map((tc) => ({
        input: tc.input, expected: tc.expectedOutput, actual: 'Function not found', passed: false,
      })),
    });
  }

  const results: { input: string; expected: string; actual: string; passed: boolean; stdout?: string }[] = [];
  let overallStatus: 'Accepted' | 'Wrong Answer' | 'Compile Error' | 'Runtime Error' | 'Time Limit Exceeded' = 'Accepted';
  let compileError: string | null = null;
  let totalRuntime = 0;

  for (const tc of testcasesToRun) {
    try {
      const wrapped = buildWrapperCode(code, language, fn, tc.input);
      let actual: string;
      let debugOut: string | undefined;
      let runtimeMs: number;

      // Try Judge0 first (with Redis cache)
      try {
        const ck = cacheKey(language, wrapped, tc.input);
        let resultStr = await cacheGet(ck);
        if (resultStr) {
          const cached = JSON.parse(resultStr);
          runtimeMs = cached.runtimeMs;
          actual = cached.actual;
          if (cached.overallStatus === 'Compile Error') {
            overallStatus = 'Compile Error';
            compileError = cached.error ?? null;
            results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed: false });
            break;
          }
          if (cached.overallStatus === 'Time Limit Exceeded') {
            if (overallStatus === 'Accepted') overallStatus = 'Time Limit Exceeded';
            results.push({ input: tc.input, expected: tc.expectedOutput, actual: 'Time limit exceeded', passed: false });
            break;
          }
          if (cached.overallStatus === 'Runtime Error') {
            if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
            results.push({ input: tc.input, expected: tc.expectedOutput, actual: cached.error || 'Runtime error', passed: false });
            compileError = (compileError || cached.error) ?? null;
            continue;
          }
          totalRuntime += runtimeMs;
          const passed = normalizeOutput(actual) === normalizeOutput(tc.expectedOutput);
          results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed, stdout: cached.debugOut });
          if (!passed) overallStatus = 'Wrong Answer';
          continue;
        }

        const result = await runViaJudge0(wrapped, language);
        runtimeMs = Math.round(parseFloat(result.time) * 1000);

        const jResult = judge0StatusToResult(result.statusId, result.stdout, result.stderr, result.compileOutput);
        actual = jResult.actual;

        // Cache Judge0 result
        cacheSet(ck, JSON.stringify({
          runtimeMs, actual, error: jResult.error,
          overallStatus: jResult.status,
          debugOut: undefined as string | undefined,
        }));

        if (jResult.status === 'Compile Error') {
          overallStatus = 'Compile Error';
          compileError = jResult.error ?? null;
          results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed: false });
          break;
        }
        if (jResult.status === 'Time Limit Exceeded') {
          if (overallStatus === 'Accepted') overallStatus = 'Time Limit Exceeded';
          results.push({ input: tc.input, expected: tc.expectedOutput, actual: 'Time limit exceeded', passed: false });
          break;
        }
        if (jResult.status === 'Runtime Error') {
          if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
          results.push({ input: tc.input, expected: tc.expectedOutput, actual: jResult.error || 'Runtime error', passed: false });
          compileError = (compileError || jResult.error) ?? null;
          continue;
        }

        const lines = result.stdout.split('\n').filter(l => l.trim());
        debugOut = lines.length > 1 ? lines.slice(0, -1).join('\n') : undefined;
        // Update cached entry with debug output
        cacheSet(ck, JSON.stringify({
          runtimeMs, actual, error: jResult.error,
          overallStatus: jResult.status, debugOut,
        }));
      } catch (judge0Err: any) {
        // Judge0 failed — fall back to local for JS/Python
        if (['JavaScript', 'Python'].includes(language)) {
          const localResult = await runLocal(code, language, fn, tc.input);
          actual = localResult.actual;
          debugOut = localResult.stderr || undefined;
          runtimeMs = localResult.runtimeMs;
        } else {
          throw judge0Err;
        }
      }

      totalRuntime += runtimeMs;
      const passed = normalizeOutput(actual) === normalizeOutput(tc.expectedOutput);
      results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed, stdout: debugOut });
      if (!passed) overallStatus = 'Wrong Answer';
    } catch (err: any) {
      const errType = err.type || 'Runtime Error';
      if (errType === 'Compile Error') { overallStatus = 'Compile Error'; compileError = err.message; }
      else if (overallStatus === 'Accepted') overallStatus = errType;
      results.push({ input: tc.input, expected: tc.expectedOutput, actual: err.message || errType, passed: false });
      compileError = compileError || err.message || null;
      if (errType === 'Compile Error' || errType === 'Time Limit Exceeded') break;
    }
  }

  return NextResponse.json({
    status: overallStatus,
    compileError,
    runtime: `${totalRuntime}ms`,
    memory: '0MB',
    testResults: results,
  });
}
