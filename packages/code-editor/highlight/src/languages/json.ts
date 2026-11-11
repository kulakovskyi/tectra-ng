import { TxCodeMode, TxCodeStreamLike, TxCodeTokenType } from '../code-highlight.types';

export interface TxJsonState {
  comment: boolean;
}

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/;

function jsonToken(stream: TxCodeStreamLike, state: TxJsonState): TxCodeTokenType | null {
  if (state.comment) {
    if (stream.skipTo('*/')) {
      stream.pos += 2;
      state.comment = false;
    } else {
      stream.skipToEnd();
    }
    return 'comment';
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
    return jsonToken(stream, state) ?? 'comment';
  }
  const char = stream.peek();
  if (char === '"') {
    stream.next();
    let escaped = false;
    while (!stream.eol()) {
      const next = stream.next();
      if (next === '"' && !escaped) {
        break;
      }
      escaped = !escaped && next === '\\';
    }
    return stream.match(/\s*:/, false) ? 'key' : 'value';
  }
  if (stream.match(NUMBER)) {
    return 'number';
  }
  if (stream.match(/true|false|null/)) {
    return 'literal';
  }
  stream.next();
  return 'delimiter';
}

export const TX_JSON_MODE: TxCodeMode<TxJsonState> = {
  language: 'json',
  comments: { line: '//', block: ['/*', '*/'] },
  start: () => ({ comment: false }),
  copy: (state) => ({ ...state }),
  token: jsonToken,
};
