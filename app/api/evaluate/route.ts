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

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN || '';

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
  returnType: string;
}

function extractFunction(code: string, language: string): ExtractedFn | null {
  let name: string | null = null;
  let isClassMethod = false;
  let returnType = 'string';

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
    // Detect return type from JSDoc @return
    const returnMatch = code.match(/@return\s+\{(\w+)\}/);
    if (returnMatch) returnType = toCanonicalType(returnMatch[1]);
  }

  if (language === 'Python') {
    const codeNoCommentsPy = code.replace(/#.*$/gm, '');
    isClassMethod = /^\s*class\s+\w+/m.test(codeNoCommentsPy);
    const defMatch = codeNoCommentsPy.match(/def\s+(\w+)\s*\(/);
    if (defMatch) name = defMatch[1];
    // Detect return type from type hint (handle Optional[ListNode] etc.)
    const retHint = codeNoCommentsPy.match(/\)\s*->\s*(\w+(?:\[.*?\])?)/);
    if (retHint) returnType = toCanonicalType(retHint[1]);
  }

  if (language === 'C++') {
    isClassMethod = /\bclass\s+Solution\b/.test(code);
    const lines = code.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(\w+(?:\s*<[^>]*>)?(?:\s*\*)?)\s+(\w+)\s*\(/);
      if (match && !['if', 'for', 'while', 'switch', 'catch'].includes(match[2])) {
        name = match[2];
        returnType = toCanonicalType(match[1]);
        break;
      }
    }
  }

  if (language === 'Java') {
    isClassMethod = /\bclass\s+Solution\b/.test(code);
    const methodMatch = code.match(/(?:public\s+)?(\w+(?:\[\])?(?:<[^>]*>)?)\s+(\w+)\s*\(/);
    if (methodMatch && methodMatch[2] !== 'main' && methodMatch[2] !== 'Solution') {
      name = methodMatch[2];
      if (methodMatch[1]) returnType = toCanonicalType(methodMatch[1]);
    }
  }

  if (language === 'Go') {
    const funcMatch = code.match(/func\s+(\w+)\s*\(/);
    if (funcMatch && funcMatch[1] !== 'main') name = funcMatch[1];
  }

  if (!name) return null;

  let paramTypes: string[] = [];
  if (language === 'JavaScript') {
    // Read param types from JSDoc @param {Type} name annotations (supports Type and Type[])
    const paramRegex = /@param\s+\{(\w+(?:\[\])?(?:<[\w,\s>]*>)?)\}\s+\w+/g;
    let m;
    while ((m = paramRegex.exec(code)) !== null) {
      paramTypes.push(toCanonicalType(m[1]));
    }
  }
  if (paramTypes.length === 0) {
    const sig = extractSignature(code, language, name);
    if (sig) paramTypes = extractParamTypes(sig);
  }

  return { name, isClassMethod, paramTypes, returnType };
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
  if (lower.includes('listnode')) return 'listnode';
  if (lower.includes('vector') && lower.includes('int')) return 'vector<int>';
  if (lower.includes('int') && lower.includes('[')) return 'int[]';
  if (lower === 'int' || lower === 'integer' || lower === 'number') return 'int';
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

  const rawTrimmed = rawTypes.map(t => t.replace(/[&*]/g, '').trim());
  // Strip `self`/`cls` prefix for Python class methods
  const filtered = (rawTrimmed[0] === 'self' || rawTrimmed[0] === 'cls') ? rawTypes.slice(1) : rawTypes;

  return filtered.map((t) => {
    const clean = t.replace(/[&*]/g, '').trim();
    // Handle Python type hints: `param: Type` or `param: Type = default`
    const pyMatch = clean.match(/:\s*(\w+(?:\[.*?\])?)/);
    if (pyMatch) return toCanonicalType(pyMatch[1]);
    // Handle C++/Java style: `Type param` or `Type& param`
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
  if (type === 'listnode') {
    return jsonStr; // raw JSON array, handled by argDefs in buildWrapperCode
  }
  if (type === 'int') return String(val);
  if (type === 'double') return String(val);
  if (type === 'boolean') return val ? 'true' : 'false';
  if (type === 'string') return `"${(val as string).replace(/"/g, '\\"')}"`;
  return jsonStr;
}

// --------------- WRAPPER CODE GENERATION ---------------

function buildWrapperCode(code: string, language: string, fn: ExtractedFn, inputStr: string): string {

  if (language === 'Python') {
    // Inject ListNode class if not defined in user code
    const hasListNode = /\bclass\s+ListNode\b/.test(code.replace(/#.*$/gm, ''));
    const listNodeDef = hasListNode ? '' : `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`;

    const rawArgs = inputStr.split('\n').filter(l => l.trim());

    const call = fn.isClassMethod
      ? `Solution().${fn.name}(*__args)`
      : `${fn.name}(*__args)`;

    let wrapper = `${code}
# --- Judge harness ---
import json, sys
from typing import Optional
__judge_input = ${JSON.stringify(inputStr)}
__lines = [l for l in __judge_input.split('\\n') if l.strip()]
__args = [json.loads(l) for l in __lines]
`;

    // Convert listnode params from arrays to ListNode objects
    rawArgs.forEach((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'listnode') {
        wrapper += `__args[${i}] = __makeList(__args[${i}])\n`;
      }
    });

    // Serialize result
    const serialize = fn.returnType === 'listnode'
      ? `print(__listToStr(__result))`
      : `print(json.dumps(__result, separators=(',', ':')))`;

    wrapper += `__result = ${call}
${serialize}
`;

    // Prepend helper functions and ListNode def (with Optional import before user code)
    wrapper = `from typing import List, Optional
${listNodeDef}
# --- ListNode helpers ---
def __makeList(arr):
    dummy = ListNode(0)
    tail = dummy
    for v in arr:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next
def __listToStr(head):
    r = []
    cur = head
    while cur:
        r.append(str(cur.val))
        cur = cur.next
    return '[' + ','.join(r) + ']'
` + wrapper;

    return wrapper;
  }

  if (language === 'JavaScript') {
    const rawArgs = inputStr.split('\n').filter(l => l.trim());
    const typedArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return jsonToLiteral(a, t, 'JavaScript');
    });
    const callArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return t === 'listnode' ? `__arg${i}` : typedArgs[i];
    }).join(', ');

    // Build arg defs for listnode
    const argDefs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'listnode')
        return `const __arg${i} = __makeList(${typedArgs[i]});`;
      return '';
    }).filter(Boolean).join('\n');

    // Build result serialization
    let resultLine = `const __result = ${fn.name}(${callArgs});`;
    if (fn.returnType === 'listnode') {
      resultLine = `const __result = ${fn.name}(${callArgs});
process.stdout.write(__listToStr(__result));`;
    } else {
      resultLine = `const __result = ${fn.name}(${callArgs});
process.stdout.write(JSON.stringify(__result));`;
    }

    // Inject ListNode constructor if not in user code (strip comments first)
    const jsCodeClean = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const hasListNode = /\bfunction\s+ListNode\b/.test(jsCodeClean);
    const listNodeDef = hasListNode ? '' : `
function ListNode(val, next) {
  this.val = (val===undefined ? 0 : val);
  this.next = (next===undefined ? null : next);
}`;

    return `${listNodeDef}
// --- ListNode helpers ---
function __makeList(arr) {
    let dummy = new ListNode(0), tail = dummy;
    for (let v of arr) { tail.next = new ListNode(v); tail = tail.next; }
    return dummy.next;
}
function __listToStr(head) {
    let r = [];
    for (let cur = head; cur; cur = cur.next) r.push(cur.val);
    return JSON.stringify(r);
}
${code}
// --- Judge harness ---
${argDefs}
${resultLine}
`;
  }

  if (language === 'C++') {
    const rawArgs = inputStr.split('\n').filter(l => l.trim());
    const typedArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return jsonToLiteral(a, t, 'C++');
    });

    // Build variable declarations for complex types (vector<int>, listnode)
    const argDefs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'vector<int>' || t === 'int[]')
        return `  vector<int> __arg${i} = ${jsonToLiteral(a, t, 'C++')};`;
      if (t === 'listnode') {
        const arr = JSON.parse(a) as number[];
        const vals = arr.map(v => String(v)).join(',');
        return `  ListNode* __arg${i} = __makeList({${vals}});`;
      }
      return '';
    }).filter(Boolean).join('\n');

    const callArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return (t === 'vector<int>' || t === 'int[]' || t === 'listnode') ? `__arg${i}` : typedArgs[i];
    }).join(', ');

    // Add listnode result serialization if return type is listnode
    let resultStrOverload = '';
    if (fn.returnType === 'listnode') {
      resultStrOverload = `string __resultStr(ListNode* head) {
  string r = "[";
  for (ListNode* cur = head; cur; cur = cur->next) {
    if (r.size() > 1) r += ",";
    r += to_string(cur->val);
  }
  return r + "]";
}
`;
    }

    // If user code doesn't define ListNode struct (outside comments), inject it
    const codeNoCommentsCpp = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const hasListNode = /\bstruct\s+ListNode\b/.test(codeNoCommentsCpp);
    const listNodeDef = hasListNode ? '' : `
struct ListNode {
  int val;
  ListNode *next;
  ListNode() : val(0), next(nullptr) {}
  ListNode(int x) : val(x), next(nullptr) {}
  ListNode(int x, ListNode *next) : val(x), next(next) {}
};`;

    return `#include <bits/stdc++.h>
using namespace std;
${listNodeDef}
${code}
// --- ListNode helpers ---
ListNode* __makeList(initializer_list<int> vals) {
  ListNode dummy(0), *tail = &dummy;
  for (int v : vals) tail = tail->next = new ListNode(v);
  return dummy.next;
}
${resultStrOverload}string __resultStr(const vector<int>& v) {
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
${argDefs}
  ${fn.isClassMethod ? 'Solution __sol;' : ''}
  cout << __resultStr(${fn.isClassMethod ? '__sol.' : ''}${fn.name}(${callArgs})) << endl;
  return 0;
}
`;
  }

  if (language === 'Java') {
    const rawArgs = inputStr.split('\n').filter(l => l.trim());
    const typedArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return jsonToLiteral(a, t, 'Java');
    });

    const argDefs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'vector<int>' || t === 'int[]')
        return jsonToLiteral(a, t, 'Java');
      if (t === 'listnode') {
        const arr = JSON.parse(a) as number[];
        const vals = arr.map(v => String(v)).join(',');
        return `__makeList(new int[]{${vals}})`;
      }
      return '';
    }).filter(Boolean);

    // Inject ListNode class if not defined in user code
    const hasListNode = /\bclass\s+ListNode\b/.test(code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''));
    const listNodeDef = hasListNode ? '' : `
  static class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
  }`;

    // Strip import statements (we already have import java.util.*)
    const codeWithoutImports = code.replace(/^import\s+.*;$/gm, '');
    const patchedCode = codeWithoutImports.replace(/\bclass\b/g, 'static class');

    const callArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'vector<int>' || t === 'int[]' || t === 'listnode')
        return argDefs[i] || typedArgs[i];
      return typedArgs[i];
    }).join(', ');

    // Add ListNode result serialization
    let resultStrOverload = '';
    if (fn.returnType === 'listnode') {
      resultStrOverload = `  static String __resultStr(ListNode head) {
    StringBuilder sb = new StringBuilder("[");
    for (ListNode cur = head; cur != null; cur = cur.next) {
      if (sb.length() > 1) sb.append(",");
      sb.append(cur.val);
    }
    return sb.append("]").toString();
  }
`;
    }

    return `import java.util.*;
import java.util.stream.*;

public class Main {
${listNodeDef}${patchedCode}

  // --- ListNode helpers ---
  static ListNode __makeList(int[] vals) {
    ListNode dummy = new ListNode(0), tail = dummy;
    for (int v : vals) { tail.next = new ListNode(v); tail = tail.next; }
    return dummy.next;
  }
${resultStrOverload}  static String __resultStr(int[] v) {
    return Arrays.stream(v).mapToObj(String::valueOf).collect(Collectors.joining(",", "[", "]"));
  }
  static String __resultStr(int x) { return String.valueOf(x); }
  static String __resultStr(double x) { return String.valueOf(x); }
  static String __resultStr(boolean x) { return String.valueOf(x); }
  static String __resultStr(String s) { return s; }

  public static void main(String[] args) {
    ${fn.isClassMethod ? 'Solution __sol = new Solution();' : ''}
    System.out.print(__resultStr(${fn.isClassMethod ? '__sol.' : 'new Main().'}${fn.name}(${callArgs})));
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

  const isJava = language === 'Java';
  const response = await fetch(`${JUDGE0_API_URL}/submissions?wait=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source_code: code,
      language_id: langId,
      stdin: '',
      cpu_time_limit: 5,
      memory_limit: isJava ? 768000 : 256000,
      enable_per_process_and_thread_time_limit: true,
      enable_per_process_and_thread_memory_limit: true,
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

        // Skip Judge0 for JS (Node.js SIGSEGV in isolate sandbox) – run locally
        if (language === 'JavaScript') {
          const localResult = await runLocal(code, language, fn, tc.input);
          actual = localResult.actual;
          debugOut = localResult.stderr || undefined;
          runtimeMs = localResult.runtimeMs;
          totalRuntime += runtimeMs;
          const passed = normalizeOutput(actual) === normalizeOutput(tc.expectedOutput);
          results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed, stdout: debugOut });
          if (!passed) overallStatus = 'Wrong Answer';
          continue;
        }

        const result = await runViaJudge0(wrapped, language);
        runtimeMs = Math.round(parseFloat(result.time) * 1000);

        const jResult = judge0StatusToResult(result.statusId, result.stdout, result.stderr, result.compileOutput);
        actual = jResult.actual;

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
        cacheSet(ck, JSON.stringify({
          runtimeMs, actual, error: jResult.error,
          overallStatus: jResult.status, debugOut,
        }));
      } catch (judge0Err: any) {
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
