const KEYWORDS = new Set([
  'var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'class', 'new', 'this', 'super',
  'import', 'export', 'default', 'from', 'async', 'await', 'yield', 'typeof',
  'instanceof', 'void', 'delete', 'in', 'of', 'try', 'catch', 'finally',
  'throw', 'extends', 'implements', 'interface', 'package', 'private',
  'protected', 'public', 'static', 'def', 'if', 'elif', 'else', 'for', 'while',
  'in', 'not', 'and', 'or', 'is', 'lambda', 'with', 'as', 'pass', 'raise',
  'None', 'True', 'False', 'class', 'return', 'yield', 'import', 'from',
  'try', 'except', 'finally', 'assert', 'del', 'global', 'nonlocal',
  'int', 'float', 'double', 'bool', 'char', 'string', 'void', 'auto',
  'const', 'signed', 'unsigned', 'short', 'long', 'struct', 'enum', 'union',
  'typedef', 'namespace', 'using', 'template', 'typename', 'virtual',
  'override', 'friend', 'explicit', 'operator', 'nullptr', 'NULL', 'true',
  'false', 'nil', 'package', 'func', 'defer', 'go', 'range', 'select',
  'chan', 'map', 'interface', 'type', 'struct', 'nil', 'fallthrough',
  'continue', 'break', 'default', 'switch', 'case', 'go', 'goto'
]);

const TYPES = new Set([
  'ListNode', 'LinkedList', 'TreeNode', 'Tree', 'Node', 'Optional',
  'string', 'String', 'number', 'boolean', 'Boolean', 'Array', 'Object',
  'Promise', 'Error', 'Map', 'Set', 'List', 'Queue', 'Stack', 'Deque',
  'vector', 'map', 'set', 'unordered_map', 'unordered_set', 'pair',
  'list', 'stack', 'queue', 'deque', 'priority_queue', 'shared_ptr',
  'unique_ptr', 'string_view', 'optional', 'any', 'variant', 'tuple',
  'int32_t', 'int64_t', 'size_t', 'uint32_t', 'uint64_t', 'int8_t'
]);

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightCode(code: string, _lang: string): string {
  const tokens: { text: string; type: string | null }[] = [];
  let i = 0;

  while (i < code.length) {
    const remaining = code.slice(i);

    const singleComment = remaining.match(/^\/\/[^\n]*/);
    if (singleComment) {
      tokens.push({ text: singleComment[0], type: 'comment' });
      i += singleComment[0].length;
      continue;
    }

    const multiComment = remaining.match(/^\/\*[\s\S]*?\*\//);
    if (multiComment) {
      tokens.push({ text: multiComment[0], type: 'comment' });
      i += multiComment[0].length;
      continue;
    }

    const hashComment = remaining.match(/^#[^\n]*/);
    if (hashComment) {
      tokens.push({ text: hashComment[0], type: 'comment' });
      i += hashComment[0].length;
      continue;
    }

    const singleQuoteStr = remaining.match(/^'(?:[^'\\]|\\.)*'/);
    if (singleQuoteStr) {
      tokens.push({ text: singleQuoteStr[0], type: 'string' });
      i += singleQuoteStr[0].length;
      continue;
    }

    const backtickStr = remaining.match(/^`(?:[^`\\]|\\.)*`/);
    if (backtickStr) {
      tokens.push({ text: backtickStr[0], type: 'string' });
      i += backtickStr[0].length;
      continue;
    }

    const doubleQuoteStr = remaining.match(/^"(?:[^"\\]|\\.)*"/);
    if (doubleQuoteStr) {
      tokens.push({ text: doubleQuoteStr[0], type: 'string' });
      i += doubleQuoteStr[0].length;
      continue;
    }

    const number = remaining.match(/^\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/);
    if (number) {
      tokens.push({ text: number[0], type: 'number' });
      i += number[0].length;
      continue;
    }

    const word = remaining.match(/^[A-Za-z_$]\w*/);
    if (word) {
      const w = word[0];
      if (KEYWORDS.has(w)) {
        tokens.push({ text: w, type: 'keyword' });
      } else if (TYPES.has(w)) {
        tokens.push({ text: w, type: 'type' });
      } else {
        tokens.push({ text: w, type: null });
      }
      i += w.length;
      continue;
    }

    if (remaining[0] === '\n') {
      tokens.push({ text: '\n', type: null });
      i++;
      continue;
    }

    tokens.push({ text: remaining[0], type: null });
    i++;
  }

  return tokens.map(t => {
    if (!t.type) return escapeHtml(t.text);
    return `<span class="syn-${t.type}">${escapeHtml(t.text)}</span>`;
  }).join('');
}
