import { NextRequest, NextResponse } from 'next/server';
import { execFile, exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { prisma } from '@/src/lib/prisma';
import { cacheKey, cacheGet, cacheSet } from './cache';
import { PROBLEMS_DATA } from '@/src/data/data';

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);
const TIMEOUT_MS = 10000;
const JUDGE0_TIMEOUT_MS = 25000;
const OVERALL_TIMEOUT_MS = 60000;

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (err: any) {
      const msg = err?.message || '';
      if (i < retries && (msg.includes('closed the connection') || msg.includes('ECONNRESET') || msg.includes('pool'))) {
        await new Promise(r => setTimeout(r, 200 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}

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
    const patterns = [
      /(?:var|const|let)\s+(\w+)\s*=\s*(?:async\s+)?function\s*(?:\w+\s*)?\(/,
      /(?:var|const|let)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/,
      /(?:var|const|let)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*(?:[^{])/,
      /(?:async\s+)?function\s+(\w+)\s*\(/,
    ];
    for (const re of patterns) {
      const m = code.match(re);
      if (m) { name = m[1]; break; }
    }
    // Detect return type from JSDoc @return (full type including generics/arrays)
    const returnMatch = code.match(/@return\s+\{([^}]+)\}/);
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
    // Read param types from JSDoc @param annotations
    const paramRegex = /@param\s+\{([^}]+)\}\s+\w+/g;
    let m;
    while ((m = paramRegex.exec(code)) !== null) {
      paramTypes.push(toCanonicalType(m[1]));
    }
  }
  if (paramTypes.length === 0) {
    const sig = extractSignature(code, language, name);
    if (sig) paramTypes = extractParamTypes(sig, language);
  }

  const codeClean = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const hasListNodeDef = /\bfunction\s+ListNode\b/.test(codeClean) || /\bclass\s+ListNode\b/.test(codeClean);
  const hasTreeNodeDef = /\bfunction\s+TreeNode\b/.test(codeClean) || /\bclass\s+TreeNode\b/.test(codeClean);
  const hasListNodeRef = /\bnew\s+ListNode\b/.test(codeClean) || /\bListNode\s*\(/.test(codeClean);
  const hasTreeNodeRef = /\bnew\s+TreeNode\b/.test(codeClean) || /\bTreeNode\s*\(/.test(codeClean);
  const usesListNode = hasListNodeDef || hasListNodeRef;
  const usesTreeNode = hasTreeNodeDef || hasTreeNodeRef;
  const hasTreeProps = /\.\s*(left|right)\b/.test(codeClean) || /\bnull\b.*\.\s*(left|right)\b/.test(codeClean);

  if (paramTypes.every(t => t === 'string') && (usesListNode || usesTreeNode || hasTreeProps)) {
    const sig = extractSignature(code, language, name);
    if (sig) {
      const paramsMatch = sig.match(/\(([^)]*)\)/);
      if (paramsMatch) {
        const paramNames = paramsMatch[1].split(',').map(p => {
          const parts = p.trim().split(/[\s:=]/).filter(Boolean);
          return parts[0] || '';
        }).filter(n => n && n !== 'self' && n !== 'cls');
        const listNodeNames = ['head', 'l1', 'l2', 'list', 'lists', 'node', 'p', 'q', 'a', 'b', 'n1', 'n2'];
        const treeNodeNames = ['root', 'p', 'q', 'n1', 'n2'];
        if (usesTreeNode && paramNames.some(n => treeNodeNames.includes(n))) {
          paramTypes = paramNames.map(n => treeNodeNames.includes(n) ? 'treenode' : 'string');
        } else if (hasTreeProps && paramNames.some(n => treeNodeNames.includes(n))) {
          paramTypes = paramNames.map(n => treeNodeNames.includes(n) ? 'treenode' : 'string');
        } else if (usesListNode && paramNames.some(n => listNodeNames.includes(n))) {
          paramTypes = paramNames.map(n => listNodeNames.includes(n) ? 'listnode' : 'string');
          if (returnType === 'string') returnType = 'listnode';
        }
      }
    }
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
  if (lower === 'int' || lower === 'integer' || lower === 'number') return 'int';
  if (lower === 'double' || lower === 'float') return 'double';
  if (lower === 'string' || lower === 'str' || s === 'String') return 'string';
  if (lower === 'bool' || lower === 'boolean') return 'boolean';
  if (lower === 'number[]') return 'int[]';
  if (lower === 'number[][]') return 'int[][]';
  if (lower === 'string[]') return 'vector<string>';
  if (lower === 'string[][]') return 'vector<vector<string>>';
  if (lower.includes('vector') && lower.includes('int')) return 'vector<int>';
  if (lower.includes('int') && lower.includes('[')) return 'int[]';
  if (lower.includes('string') && (lower.startsWith('vector<') || (lower.includes('[') && lower.includes(']')))) return 'vector<string>';
  if (lower.startsWith('vector<') || (lower.includes('[') && lower.includes(']'))) return 'vector<int>';
  return 'string';
}

function extractParamTypes(sig: string, language?: string): string[] {
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
    // Handle Go style: `name type` (type is after the first space)
    if (language === 'Go') {
      const parts = clean.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return toCanonicalType(parts.slice(1).join(' '));
      return 'string';
    }
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
  if (type === 'vector<string>') {
    const arr = val as string[];
    if (language === 'C++') return `{${arr.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`;
    if (language === 'Java') return `new String[]{${arr.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`;
    if (language === 'Go') return `[]string{${arr.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}`;
  }
  if (type === 'listnode' || type === 'treenode') {
    return jsonStr;
  }
  if (type === 'int') return String(val);
  if (type === 'double') return String(val);
  if (type === 'boolean') return val ? 'true' : 'false';
  if (type === 'string') {
    if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
    return JSON.stringify(val);
  }
  return jsonStr;
}

// --------------- WRAPPER CODE GENERATION ---------------

function buildWrapperCode(code: string, language: string, fn: ExtractedFn, inputStr: string): string {

  if (language === 'Python') {
    const codeNoCommentsPy = code.replace(/#.*$/gm, '');
    const hasListNode = /\bclass\s+ListNode\b/.test(codeNoCommentsPy);
    const hasTreeNode = /\bclass\s+TreeNode\b/.test(codeNoCommentsPy);
    const needsTreeNode = fn.paramTypes.includes('treenode') || fn.returnType === 'treenode';
    const needsListNode = fn.paramTypes.includes('listnode') || fn.returnType === 'listnode';
    const listNodeDef = hasListNode ? '' : `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`;
    const treeNodeDef = (hasTreeNode || !needsTreeNode) ? '' : `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right`;

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

    // Convert listnode/treenode params from arrays to objects
    rawArgs.forEach((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'listnode') {
        wrapper += `__args[${i}] = __makeList(__args[${i}])\n`;
      } else if (t === 'treenode') {
        wrapper += `__args[${i}] = __makeTree(__args[${i}])\n`;
      }
    });

    // Serialize result
    let serialize: string;
    if (fn.returnType === 'listnode') {
      serialize = `print(__listToStr(__result))`;
    } else if (fn.returnType === 'treenode') {
      serialize = `print(__treeToStr(__result))`;
    } else if (fn.returnType === 'string') {
      serialize = `print(json.dumps(__result, separators=(',', ':')) if not isinstance(__result, str) else __result)`;
    } else {
      serialize = `print(json.dumps(__result, separators=(',', ':')))`;
    }

    wrapper += `__result = ${call}
${serialize}
`;

    // Prepend helper functions and class defs
    wrapper = `from typing import List, Optional
${listNodeDef}${treeNodeDef}
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
# --- TreeNode helpers ---
from collections import deque
def __makeTree(arr):
    if not arr:
        return None
    root = TreeNode(arr[0])
    queue = deque([root])
    i = 1
    while i < len(arr):
        node = queue.popleft()
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root
def __treeToStr(root):
    if not root:
        return '[]'
    r = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node:
            r.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            r.append(None)
    while r and r[-1] is None:
        r.pop()
    return json.dumps(r, separators=(',', ':'))
` + wrapper;

    return wrapper;
  }

  if (language === 'JavaScript') {
    const rawArgs = inputStr.split('\n').filter(l => l.trim());
    if (rawArgs.length === 0) {
      return `// --- Error: No input arguments provided ---
${code}
// --- Judge harness ---
process.stdout.write(JSON.stringify(${fn.name}()));
`;
    }
    const typedArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return jsonToLiteral(a, t, 'JavaScript');
    });
    const callArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return (t === 'listnode' || t === 'treenode') ? `__arg${i}` : typedArgs[i];
    }).join(', ');

    // Build arg defs for listnode/treenode
    const argDefs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'listnode')
        return `const __arg${i} = __makeList(${typedArgs[i]});`;
      if (t === 'treenode')
        return `const __arg${i} = __makeTree(${typedArgs[i]});`;
      return '';
    }).filter(Boolean).join('\n');

    // Build result serialization
    let resultLine = `const __result = ${fn.name}(${callArgs});`;
    if (fn.returnType === 'listnode') {
      resultLine = `const __result = ${fn.name}(${callArgs});
process.stdout.write(__listToStr(__result));`;
    } else if (fn.returnType === 'treenode') {
      resultLine = `const __result = ${fn.name}(${callArgs});
process.stdout.write(__treeToStr(__result));`;
    } else if (fn.returnType === 'string') {
      resultLine = `const __result = ${fn.name}(${callArgs});
process.stdout.write(typeof __result === 'string' ? __result : JSON.stringify(__result));`;
    } else {
      resultLine = `const __result = ${fn.name}(${callArgs});
process.stdout.write(JSON.stringify(__result));`;
    }

    // Inject ListNode/TreeNode constructors if not in user code (strip comments first)
    const jsCodeClean = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const hasListNode = /\bfunction\s+ListNode\b/.test(jsCodeClean);
    const hasTreeNode = /\bfunction\s+TreeNode\b/.test(jsCodeClean);
    const needsTreeNode = fn.paramTypes.includes('treenode') || fn.returnType === 'treenode';
    const needsListNode = fn.paramTypes.includes('listnode') || fn.returnType === 'listnode';
    const listNodeDef = hasListNode ? '' : `
function ListNode(val, next) {
  this.val = (val===undefined ? 0 : val);
  this.next = (next===undefined ? null : next);
}`;
    const treeNodeDef = (hasTreeNode || !needsTreeNode) ? '' : `
function TreeNode(val, left, right) {
  this.val = (val===undefined ? 0 : val);
  this.left = (left===undefined ? null : left);
  this.right = (right===undefined ? null : right);
}`;

    return `${listNodeDef}${treeNodeDef}
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
// --- TreeNode helpers ---
function __makeTree(arr) {
    if (!arr || arr.length === 0) return null;
    let root = new TreeNode(arr[0]);
    let queue = [root];
    let i = 1;
    while (i < arr.length) {
        let node = queue.shift();
        if (i < arr.length && arr[i] !== null) {
            node.left = new TreeNode(arr[i]);
            queue.push(node.left);
        }
        i++;
        if (i < arr.length && arr[i] !== null) {
            node.right = new TreeNode(arr[i]);
            queue.push(node.right);
        }
        i++;
    }
    return root;
}
function __treeToStr(root) {
    if (!root) return '[]';
    let r = [];
    let queue = [root];
    while (queue.length > 0) {
        let node = queue.shift();
        if (node) {
            r.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
        } else {
            r.push(null);
        }
    }
    while (r.length > 0 && r[r.length - 1] === null) r.pop();
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

    // Build variable declarations for complex types (vector<int>, vector<string>, listnode)
    const argDefs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'vector<int>' || t === 'int[]')
        return `  vector<int> __arg${i} = ${jsonToLiteral(a, t, 'C++')};`;
      if (t === 'vector<string>')
        return `  vector<string> __arg${i} = ${jsonToLiteral(a, t, 'C++')};`;
      if (t === 'listnode') {
        const arr = JSON.parse(a) as number[];
        const vals = arr.map(v => String(v)).join(',');
        return `  ListNode* __arg${i} = __makeList({${vals}});`;
      }
      return '';
    }).filter(Boolean).join('\n');

    const callArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      return (t === 'vector<int>' || t === 'int[]' || t === 'vector<string>' || t === 'listnode') ? `__arg${i}` : typedArgs[i];
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
string __resultStr(const vector<string>& v) {
  string r = "[";
  for (size_t i = 0; i < v.size(); i++) {
    if (i) r += ",";
    r += "\"" + v[i] + "\"";
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
      if (t === 'vector<string>')
        return jsonToLiteral(a, t, 'Java');
      if (t === 'listnode') {
        const arr = JSON.parse(a) as number[];
        const vals = arr.map(v => String(v)).join(',');
        return `__makeList(new int[]{${vals}})`;
      }
      if (t === 'treenode') {
        const arr = JSON.parse(a) as (number | null)[];
        return `__makeTree(new Integer[]{${arr.map(v => v === null ? 'null' : String(v)).join(',')}})`;
      }
      return '';
    }).filter(Boolean);

    const codeClean = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const hasListNode = /\bclass\s+ListNode\b/.test(codeClean);
    const hasTreeNode = /\bclass\s+TreeNode\b/.test(codeClean);
    const needsTreeNode = fn.paramTypes.includes('treenode') || fn.returnType === 'treenode';
    const needsListNode = fn.paramTypes.includes('listnode') || fn.returnType === 'listnode';
    const listNodeDef = hasListNode ? '' : `
  static class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
  }`;
    const treeNodeDef = (hasTreeNode || !needsTreeNode) ? '' : `
  static class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
  }`;

    // Strip import statements (we already have import java.util.*)
    const codeWithoutImports = code.replace(/^import\s+.*;$/gm, '');
    const patchedCode = codeWithoutImports.replace(/\bclass\b/g, 'static class');

    const callArgs = rawArgs.map((a, i) => {
      const t = i < fn.paramTypes.length ? fn.paramTypes[i] : 'string';
      if (t === 'vector<int>' || t === 'int[]' || t === 'vector<string>' || t === 'listnode' || t === 'treenode')
        return argDefs[i] || typedArgs[i];
      return typedArgs[i];
    }).join(', ');

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
    if (fn.returnType === 'treenode') {
      resultStrOverload += `  static String __resultStr(TreeNode root) {
    if (root == null) return "[]";
    java.util.List<String> r = new java.util.ArrayList<>();
    java.util.Queue<TreeNode> q = new java.util.LinkedList<>();
    q.add(root);
    while (!q.isEmpty()) {
      TreeNode node = q.poll();
      if (node != null) {
        r.add(String.valueOf(node.val));
        q.add(node.left);
        q.add(node.right);
      } else {
        r.add("null");
      }
    }
    while (!r.isEmpty() && r.get(r.size()-1).equals("null")) r.remove(r.size()-1);
    return "[" + String.join(",", r) + "]";
  }
`;
    }

    return `import java.util.*;
import java.util.stream.*;

public class Main {
${listNodeDef}${treeNodeDef}${patchedCode}

  // --- ListNode helpers ---
  static ListNode __makeList(int[] vals) {
    ListNode dummy = new ListNode(0), tail = dummy;
    for (int v : vals) { tail.next = new ListNode(v); tail = tail.next; }
    return dummy.next;
  }
${needsTreeNode ? `  // --- TreeNode helpers ---
  static TreeNode __makeTree(Integer[] vals) {
    if (vals == null || vals.length == 0 || vals[0] == null) return null;
    TreeNode root = new TreeNode(vals[0]);
    java.util.Queue<TreeNode> q = new java.util.LinkedList<>();
    q.add(root);
    int i = 1;
    while (!q.isEmpty() && i < vals.length) {
      TreeNode node = q.poll();
      if (i < vals.length && vals[i] != null) {
        node.left = new TreeNode(vals[i]);
        q.add(node.left);
      }
      i++;
      if (i < vals.length && vals[i] != null) {
        node.right = new TreeNode(vals[i]);
        q.add(node.right);
      }
      i++;
    }
    return root;
  }
` : ''}
${resultStrOverload}  static String __resultStr(int[] v) {
    return Arrays.stream(v).mapToObj(String::valueOf).collect(Collectors.joining(",", "[", "]"));
  }
  static String __resultStr(String[] v) {
    return Arrays.stream(v).collect(Collectors.joining(",", "[", "]"));
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
  case []string:
    s := "["
    for i, n := range x {
      if i > 0 { s += "," }
      s += fmt.Sprintf("\\\"%s\\\"", n)
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
    let lines = stdout.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    const actual = lines.pop() ?? '';
    const debugOutput = lines.join('\n');
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

async function runStandaloneLocal(code: string, language: string, inputStr: string): Promise<{
  actual: string; stderr: string; runtimeMs: number
}> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'judge-'));
  const ext = language === 'JavaScript' ? '.js' : '.py';
  const srcFile = join(tmpDir, `solution${ext}`);
  await writeFile(srcFile, code, 'utf-8');

  const command = language === 'JavaScript' ? process.execPath : 'python';
  const start = Date.now();
  try {
    const { stdout, stderr } = await execAsync(`${command} ${srcFile}`, <any>{
      timeout: TIMEOUT_MS, cwd: tmpDir, maxBuffer: 1024 * 1024,
      input: inputStr,
    });
    const runtimeMs = Date.now() - start;
    await unlink(srcFile).catch(() => {});
    const actual = String(stdout).replace(/\r\n/g, '\n').replace(/\n$/, '');
    return { actual, stderr: String(stderr), runtimeMs };
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

async function runViaJudge0(code: string, language: string, inputStr = ''): Promise<{
  stdout: string; stderr: string; compileOutput: string; statusId: number; time: string; memory: string;
}> {
  const langId = JUDGE0_LANG_IDS[language];
  if (!langId) throw { type: 'Compile Error', message: `No Judge0 language ID for "${language}"` };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (JUDGE0_AUTH_TOKEN) headers['X-Auth-Token'] = JUDGE0_AUTH_TOKEN;

  const isJava = language === 'Java';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), JUDGE0_TIMEOUT_MS);

  try {
    const response = await fetch(`${JUDGE0_API_URL}/submissions?wait=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
        stdin: inputStr,
        cpu_time_limit: 5,
        memory_limit: isJava ? 768000 : 256000,
        enable_per_process_and_thread_time_limit: true,
        enable_per_process_and_thread_memory_limit: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw { type: 'Compile Error', message: `Judge0 API error (${response.status}): ${text}` };
    }

    const data = await response.json();

    // Judge0 may return status 1 (In Queue) or 2 (Processing) despite ?wait=true
    // in rare race conditions. Treat these as internal errors.
    if (data.status?.id === 1 || data.status?.id === 2) {
      throw { type: 'Runtime Error', message: 'Judge0 did not process the submission. Try again.' };
    }

    return {
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      compileOutput: data.compile_output || '',
      statusId: data.status?.id ?? 0,
      time: data.time || '0',
      memory: data.memory || '0',
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw { type: 'Time Limit Exceeded', message: 'Judge0 did not respond within the time limit' };
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

function judge0StatusToResult(statusId: number, stdout: string, stderr: string, compileOutput: string): {
  status: 'Accepted' | 'Wrong Answer' | 'Compile Error' | 'Runtime Error' | 'Time Limit Exceeded';
  error?: string;
  actual: string;
} {
  let lines = stdout.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  const actual = lines.pop() ?? '';

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
  if (statusId === 0) {
    return { status: 'Runtime Error', error: 'Judge0 did not return a valid status. The execution service may be misconfigured.', actual };
  }
  if (statusId === 13) {
    return { status: 'Runtime Error', error: stderr || compileOutput || 'Judge0 internal error — the sandbox (isolate) could not run. Ensure Docker has cgroups support or use a remote Judge0 instance.', actual };
  }

  return { status: 'Runtime Error', error: `Unknown Judge0 status: ${statusId}`, actual };
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

function normalizeOutput(output: string): string {
  return output.replace(/\s+/g, '');
}

function outputsMatch(actual: string, expected: string): boolean {
  const a = normalizeOutput(actual);
  const e = normalizeOutput(expected);
  if (a === e) return true;
  const aNum = Number(a);
  const eNum = Number(e);
  if (!isNaN(aNum) && !isNaN(eNum)) return aNum === eNum;
  return false;
}

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const overallTimeout = setTimeout(() => controller.abort(), OVERALL_TIMEOUT_MS);

  try {
    return await Promise.race([
      handleEvaluate(req),
      new Promise<Response>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('OVERALL_TIMEOUT'));
        });
      }),
    ]);
  } catch (err: any) {
    if (err.message === 'OVERALL_TIMEOUT') {
      return NextResponse.json({
        status: 'Time Limit Exceeded',
        compileError: 'Overall evaluation timed out. Check for infinite loops or excessive recursion.',
        runtime: '0ms', memory: '0MB',
        testResults: [],
      });
    }
    const msg = typeof err === 'string' ? err : err?.message || 'Unexpected error';
    return NextResponse.json({
      status: 'Runtime Error',
      compileError: msg,
      runtime: '0ms', memory: '0MB',
      testResults: [],
    });
  } finally {
    clearTimeout(overallTimeout);
  }
}

async function handleEvaluate(req: NextRequest): Promise<Response> {
  const { problemId, language, code, action, customInput, customExpected } = await req.json();

  const dbProblem = await withRetry(() => prisma.problem.findUnique({ where: { leetcodeId: Number(problemId) } }));

  if (!JUDGE0_LANG_IDS[language]) {
    return NextResponse.json({
      status: 'Compile Error',
      compileError: `"${language}" is not supported. Supported: ${Object.keys(JUDGE0_LANG_IDS).join(', ')}`,
      runtime: '0ms', memory: '0MB', testResults: [],
    });
  }


  // Fetch test cases from DB (sample for 'run', ALL including hidden for 'submit')
  let testcasesToRun: { input: string; expectedOutput: string }[];
  if (customInput) {
    testcasesToRun = [{ input: customInput, expectedOutput: customExpected !== undefined ? customExpected : 'N/A' }];
  } else if (!dbProblem) {
    const frontendProblem = PROBLEMS_DATA.find(p => p.id === Number(problemId));
    if (frontendProblem && frontendProblem.testcases?.length > 0) {
      testcasesToRun = frontendProblem.testcases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }));
    } else if (frontendProblem && frontendProblem.examples?.length > 0) {
      testcasesToRun = frontendProblem.examples.map(ex => ({
        input: parseExampleInput(ex.input).join('\n'),
        expectedOutput: ex.output,
      }));
    } else {
      testcasesToRun = [{ input: '[]', expectedOutput: 'N/A' }];
    }
  } else {
      const dbTestCases = await withRetry(() => prisma.testCase.findMany({
        where: { problemId: dbProblem.id, ...(action === 'run' ? { isSample: true } : {}) },
        orderBy: { sortOrder: 'asc' },
      }));
    if (dbTestCases.length > 0) {
      testcasesToRun = dbTestCases.map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput }));
    } else {
      const dbExamples = await withRetry(() => prisma.problemExample.findMany({
        where: { problemId: dbProblem.id },
        orderBy: { sortOrder: 'asc' },
      }));
      if (dbExamples.length > 0) {
        testcasesToRun = dbExamples.map((ex) => ({
          input: parseExampleInput(ex.input).join('\n'),
          expectedOutput: ex.output,
        }));
      } else {
        testcasesToRun = [{ input: '[]', expectedOutput: 'N/A' }];
      }
    }
  }

  if (!code || code.trim() === '') {
    return NextResponse.json({
      status: 'Compile Error',
      compileError: 'No code provided. Write your solution in the editor.',
      runtime: '0ms', memory: '0MB',
      testResults: testcasesToRun.map((tc) => ({
        input: tc.input, expected: tc.expectedOutput, actual: 'No code', passed: false,
      })),
    });
  }

  const fn = extractFunction(code, language);
  const isStandalone = !fn;

  const results: { input: string; expected: string; actual: string; passed: boolean; stdout?: string; memory?: string }[] = [];
  let overallStatus: 'Accepted' | 'Wrong Answer' | 'Compile Error' | 'Runtime Error' | 'Time Limit Exceeded' = 'Accepted';
  let compileError: string | null = null;
  let totalRuntime = 0;
  let peakMemoryKB = 0;

  for (const tc of testcasesToRun) {
    try {
      if (isStandalone) {
        // ---------- STANDALONE MODE: pipe input to stdin ----------
        const ck = `standalone:${cacheKey(language, code, tc.input)}`;
        let actual: string;
        let runtimeMs: number;

        let resultStr = await cacheGet(ck);
        if (resultStr) {
          const cached = JSON.parse(resultStr);
          runtimeMs = cached.runtimeMs;
          actual = cached.actual;
        } else {
          if (language === 'JavaScript' || language === 'Python') {
            const localResult = await runStandaloneLocal(code, language, tc.input);
            actual = localResult.actual;
            runtimeMs = localResult.runtimeMs;
          } else {
            const result = await runViaJudge0(code, language, tc.input);
            runtimeMs = Math.round(parseFloat(result.time) * 1000);
            const jResult = judge0StatusToResult(result.statusId, result.stdout, result.stderr, result.compileOutput);
            actual = jResult.actual;
          }
          cacheSet(ck, JSON.stringify({ runtimeMs, actual }));
        }

        totalRuntime += runtimeMs;
        const passed = outputsMatch(actual, tc.expectedOutput);
        results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed });
        if (!passed) overallStatus = 'Wrong Answer';
        continue;
      }

      // ---------- WRAPPER MODE (function detected) ----------
      const wrapped = buildWrapperCode(code, language, fn!, tc.input);
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
          const passed = outputsMatch(actual, tc.expectedOutput);
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
          const passed = outputsMatch(actual, tc.expectedOutput);
          results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed, stdout: debugOut });
          if (!passed) overallStatus = 'Wrong Answer';
          continue;
        }

        const result = await runViaJudge0(wrapped, language);
        runtimeMs = Math.round(parseFloat(result.time) * 1000);
        const memKB = parseInt(result.memory) || 0;
        if (memKB > peakMemoryKB) peakMemoryKB = memKB;

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
      const passed = outputsMatch(actual, tc.expectedOutput);
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

  const memoryMB = peakMemoryKB > 0 ? `${(peakMemoryKB / 1024).toFixed(1)}MB` : '0MB';

  return NextResponse.json({
    status: overallStatus,
    compileError,
    runtime: `${totalRuntime}ms`,
    memory: memoryMB,
    testResults: results,
  });
}
