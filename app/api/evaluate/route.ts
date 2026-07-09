import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { PROBLEMS_DATA } from '@/src/data';

const execFileAsync = promisify(execFile);
const TIMEOUT_MS = 5000;

const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID || '';
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '';
const USE_JDOODLE = !!(JDOODLE_CLIENT_ID && JDOODLE_CLIENT_SECRET);

// Languages that compile locally via child_process
const LOCAL_LANGS = new Set(['JavaScript', 'Python']);
// Languages that need JDoodle API
const JDOODLE_LANGS = new Set(['C++', 'Java', 'Go']);

const JDOODLE_LANG_MAP: Record<string, { lang: string; version: string }> = {
  'C++': { lang: 'cpp17', version: '0' },
  'Java': { lang: 'java', version: '3' },
  'Go': { lang: 'go', version: '1' },
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
  if (sig) paramTypes = extractParamTypes(sig, language);

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

function extractParamTypes(sig: string, _language: string): string[] {
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

// --------------- LOCAL COMPILER (JS / Python) ---------------

function buildLocalWrapper(code: string, language: string, fn: ExtractedFn, inputStr: string): string {
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

  // JavaScript
  return `${code}
// --- Judge harness ---
const __judgeInput = ${lines};
const __lines = __judgeInput.split('\\n').filter(l => l.trim() !== '');
const __args = __lines.map(l => JSON.parse(l));
const __result = ${fn.name}(...__args);
process.stdout.write(JSON.stringify(__result));
`;
}

async function runLocal(code: string, language: string, fn: ExtractedFn, inputStr: string): Promise<{
  actual: string; stderr: string; runtimeMs: number
}> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'judge-'));
  const ext = language === 'JavaScript' ? '.js' : '.py';
  const srcFile = join(tmpDir, `solution${ext}`);
  const wrapped = buildLocalWrapper(code, language, fn, inputStr);
  await writeFile(srcFile, wrapped, 'utf-8');

  const command = language === 'JavaScript' ? process.execPath : 'python';
  const start = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync(command, [srcFile], {
      timeout: TIMEOUT_MS,
      cwd: tmpDir,
      maxBuffer: 1024 * 1024,
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

// --------------- JDOODLE COMPILER (C++ / Java / Go) ---------------

function buildJdoodleWrapper(code: string, language: string, fn: ExtractedFn, inputStr: string): string {
  const args = inputStr.split('\n').filter(l => l.trim());
  const typedArgs = args.map((a, i) => {
    const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
    return jsonToLiteral(a, t, language);
  });

  if (language === 'C++') {
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

async function runViaJdoodle(code: string, language: string): Promise<{
  output: string; error: string; cpuTime: string; statusCode: number
}> {
  const langInfo = JDOODLE_LANG_MAP[language];
  const response = await fetch('https://api.jdoodle.com/v1/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      stdin: '',
      language: langInfo.lang,
      versionIndex: langInfo.version,
    }),
  });
  const data = await response.json();
  return {
    output: data.output || '',
    error: data.error || '',
    cpuTime: data.cpuTime || '0',
    statusCode: data.statusCode || 200,
  };
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

  const allLangs = new Set([...LOCAL_LANGS, ...JDOODLE_LANGS]);
  if (!allLangs.has(language)) {
    return NextResponse.json({
      status: 'Compile Error',
      compileError: `"${language}" is not supported. Supported: ${[...allLangs].join(', ')}`,
      runtime: '0ms', memory: '0MB', testResults: [],
    });
  }

  if (JDOODLE_LANGS.has(language) && !USE_JDOODLE) {
    return NextResponse.json({
      status: 'Compile Error',
      compileError: `"${language}" requires JDoodle API. Set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET env vars, or use JavaScript/Python which compile locally.`,
      runtime: '0ms', memory: '0MB', testResults: [],
    });
  }

  const testcasesToRun = customInput
    ? [{ input: customInput, expectedOutput: 'N/A' }]
    : problem.testcases;

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
      let actual: string;
      let stderr: string;
      let runtimeMs: number;

      if (LOCAL_LANGS.has(language)) {
        // Compile locally via child_process
        const result = await runLocal(code, language, fn, tc.input);
        actual = result.actual;
        stderr = result.stderr;
        runtimeMs = result.runtimeMs;
      } else {
        // Compile via JDoodle API
        const wrapped = buildJdoodleWrapper(code, language, fn, tc.input);
        const { output, error, cpuTime, statusCode } = await runViaJdoodle(wrapped, language);
        runtimeMs = Math.round(parseFloat(cpuTime) * 1000);

        if (statusCode !== 200 && statusCode !== 0) {
          throw { type: 'Compile Error', message: error || output || 'JDoodle error' };
        }

        const lines = output.split('\n').filter((l: string) => l.trim());
        actual = lines.length > 0 ? lines[lines.length - 1] : '(no output)';
        stderr = lines.length > 1 ? lines.slice(0, -1).join('\n') : '';
      }

      totalRuntime += runtimeMs;
      const passed = normalizeOutput(actual) === normalizeOutput(tc.expectedOutput);
      results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed, stdout: stderr || undefined });
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
