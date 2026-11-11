import { TxCodeMode, TxCodeStreamLike, TxCodeTokenType } from '../code-highlight.types';

type ScriptFrame = 'template' | 'expression' | 'brace';

export interface TxScriptState {
  comment: boolean;
  stack: ScriptFrame[];
  regexAllowed: boolean;
  afterDot: boolean;
}

const SHARED_KEYWORDS = [
  'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'constructor', 'continue', 'debugger', 'default', 'delete', 'do',
  'else', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if', 'import', 'in', 'instanceof', 'let', 'new',
  'null', 'of', 'return', 'set', 'static', 'super', 'switch', 'symbol', 'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var',
  'void', 'while', 'with', 'yield',
];

const TYPESCRIPT_KEYWORDS = [
  'abstract', 'any', 'as', 'asserts', 'bigint', 'boolean', 'declare', 'enum', 'global', 'implements', 'infer', 'interface', 'is',
  'keyof', 'module', 'namespace', 'never', 'number', 'object', 'out', 'override', 'package', 'private', 'protected', 'public',
  'readonly', 'require', 'satisfies', 'string', 'type', 'unique', 'unknown',
];

const JAVASCRIPT = new Set(SHARED_KEYWORDS);
const TYPESCRIPT = new Set([...SHARED_KEYWORDS, ...TYPESCRIPT_KEYWORDS]);
const VALUE_KEYWORDS = new Set(['this', 'super', 'null', 'true', 'false', 'undefined']);

const NUMBER = /0[xX][\da-fA-F_]+n?|0[bB][01_]+n?|0[oO][0-7_]+n?|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?n?/;
const IDENTIFIER = /[A-Za-z_$\u00a0-\uffff][\w$\u00a0-\uffff]*/;
const REGEXP = /\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\\\n[])+\/[dgimsuvy]*/;
const OPERATOR = /[=><!~?:&|+\-*/^%]+/;

function quoted(stream: TxCodeStreamLike, quote: string): void {
  let escaped = false;
  while (!stream.eol()) {
    const char = stream.next();
    if (char === quote && !escaped) {
      return;
    }
    escaped = !escaped && char === '\\';
  }
}

function templateText(stream: TxCodeStreamLike, state: TxScriptState): TxCodeTokenType {
  while (!stream.eol()) {
    if (stream.matchText('`')) {
      state.stack.pop();
      state.regexAllowed = false;
      return 'string';
    }
    if (stream.matchText('${', false)) {
      if (stream.pos === stream.start) {
        stream.pos += 2;
        state.stack.push('expression');
        state.regexAllowed = true;
        return 'delimiter';
      }
      return 'string';
    }
    if (stream.next() === '\\') {
      stream.next();
    }
  }
  return 'string';
}

function scriptToken(stream: TxCodeStreamLike, state: TxScriptState, keywords: Set<string>): TxCodeTokenType | null {
  if (state.comment) {
    if (stream.skipTo('*/')) {
      stream.pos += 2;
      state.comment = false;
    } else {
      stream.skipToEnd();
    }
    return 'comment';
  }
  if (state.stack[state.stack.length - 1] === 'template') {
    return templateText(stream, state);
  }
  if (stream.eatSpace()) {
    return null;
  }
  if (stream.matchText('//')) {
    stream.skipToEnd();
    return 'comment';
  }
  if (stream.matchText('/*')) {
    state.comment = true;
    return scriptToken(stream, state, keywords) ?? 'comment';
  }
  const char = stream.peek();
  const afterDot = state.afterDot;
  state.afterDot = false;
  if (char === '"' || char === "'") {
    stream.next();
    quoted(stream, char);
    state.regexAllowed = false;
    return 'string';
  }
  if (char === '`') {
    stream.next();
    state.stack.push('template');
    return templateText(stream, state);
  }
  if (/[\d.]/.test(char) && stream.match(NUMBER)) {
    state.regexAllowed = false;
    return 'number';
  }
  if (char === '/' && state.regexAllowed && stream.match(REGEXP)) {
    state.regexAllowed = false;
    return 'regexp';
  }
  const word = stream.match(IDENTIFIER);
  if (word) {
    const name = word[0];
    if (!afterDot && keywords.has(name)) {
      state.regexAllowed = !VALUE_KEYWORDS.has(name);
      return 'keyword';
    }
    state.regexAllowed = false;
    return /^[A-Z]/.test(name) ? 'type' : null;
  }
  stream.next();
  if (char === '.') {
    state.afterDot = true;
    state.regexAllowed = false;
    return 'delimiter';
  }
  if (char === '{') {
    state.stack.push('brace');
    state.regexAllowed = true;
    return 'delimiter';
  }
  if (char === '}') {
    const frame = state.stack.pop();
    if (frame === 'expression') {
      state.regexAllowed = false;
      return 'delimiter';
    }
    state.regexAllowed = true;
    return 'delimiter';
  }
  if (char === ')' || char === ']') {
    state.regexAllowed = false;
    return 'delimiter';
  }
  if (char === '@') {
    stream.match(IDENTIFIER);
    return 'type';
  }
  if (OPERATOR.test(char)) {
    stream.match(OPERATOR);
  }
  state.regexAllowed = true;
  return 'delimiter';
}

function scriptMode(language: 'javascript' | 'typescript', keywords: Set<string>): TxCodeMode<TxScriptState> {
  return {
    language,
    comments: { line: '//', block: ['/*', '*/'] },
    start: () => ({ comment: false, stack: [], regexAllowed: true, afterDot: false }),
    copy: (state) => ({ ...state, stack: [...state.stack] }),
    token: (stream, state) => scriptToken(stream, state, keywords),
  };
}

export const TX_JAVASCRIPT_MODE = scriptMode('javascript', JAVASCRIPT);
export const TX_TYPESCRIPT_MODE = scriptMode('typescript', TYPESCRIPT);
