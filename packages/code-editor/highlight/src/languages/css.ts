import { TxCodeMode, TxCodeStreamLike, TxCodeTokenType } from '../code-highlight.types';

export interface TxCssState {
  comment: boolean;
  depth: number;
  value: boolean;
  prelude: boolean;
  quote: string;
}

const NUMBER = /[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(?:%|[a-zA-Z]+)?/;
const WORD = /-?[A-Za-z_\u00a0-\uffff][\w\u00a0-\uffff-]*/;
const PROPERTY = /--?[A-Za-z_][\w-]*(?=\s*:(?![^;{}]*\{))|[A-Za-z][\w-]*(?=\s*:(?![^;{}]*\{))/;

function quoted(stream: TxCodeStreamLike, state: TxCssState): TxCodeTokenType {
  let escaped = false;
  while (!stream.eol()) {
    const char = stream.next();
    if (char === state.quote && !escaped) {
      state.quote = '';
      return 'string';
    }
    escaped = !escaped && char === '\\';
  }
  if (!escaped) {
    state.quote = '';
  }
  return 'string';
}

function cssToken(stream: TxCodeStreamLike, state: TxCssState): TxCodeTokenType | null {
  if (state.comment) {
    if (stream.skipTo('*/')) {
      stream.pos += 2;
      state.comment = false;
    } else {
      stream.skipToEnd();
    }
    return 'comment';
  }
  if (state.quote) {
    return quoted(stream, state);
  }
  if (stream.eatSpace()) {
    return null;
  }
  if (stream.matchText('/*')) {
    state.comment = true;
    return cssToken(stream, state) ?? 'comment';
  }
  const char = stream.peek();
  if (char === '"' || char === "'") {
    stream.next();
    state.quote = char;
    return quoted(stream, state);
  }
  if (char === '{') {
    stream.next();
    state.depth++;
    state.value = false;
    state.prelude = false;
    return 'delimiter';
  }
  if (char === '}') {
    stream.next();
    state.depth = Math.max(0, state.depth - 1);
    state.value = false;
    return 'delimiter';
  }
  if (char === ';') {
    stream.next();
    state.value = false;
    state.prelude = false;
    return 'delimiter';
  }
  if (char === '@' && stream.match(/@[\w-]+/)) {
    state.prelude = true;
    return 'keyword';
  }
  if (state.value || state.prelude) {
    if (stream.match(/!\s*important/i)) {
      return 'keyword';
    }
    if (char === '#' && stream.match(/#[\da-fA-F]{3,8}\b/)) {
      return 'value';
    }
    if (/[\d.+-]/.test(char) && stream.match(NUMBER)) {
      return 'number';
    }
    if (state.prelude && stream.match(PROPERTY)) {
      return 'attribute';
    }
    if (stream.match(WORD)) {
      return 'value';
    }
    stream.next();
    return 'delimiter';
  }
  if (state.depth > 0 && stream.match(PROPERTY)) {
    return 'attribute';
  }
  if (char === ':' && state.depth > 0 && stream.match(/:(?![^;{}]*\{)/)) {
    state.value = true;
    return 'delimiter';
  }
  if (char === ',' || char === '>' || char === '+' || char === '~' || char === '(' || char === ')') {
    stream.next();
    return 'delimiter';
  }
  if (stream.match(/[^\s{},;/"'>+~()]+/)) {
    return 'tag';
  }
  stream.next();
  return 'delimiter';
}

export const TX_CSS_MODE: TxCodeMode<TxCssState> = {
  language: 'css',
  comments: { block: ['/*', '*/'] },
  start: () => ({ comment: false, depth: 0, value: false, prelude: false, quote: '' }),
  copy: (state) => ({ ...state }),
  token: cssToken,
};
