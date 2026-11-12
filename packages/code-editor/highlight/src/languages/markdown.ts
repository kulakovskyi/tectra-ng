import { TxCodeLanguage, TxCodeMode, TxCodeStreamLike, TxCodeTokenType } from '../code-highlight.types';

export interface TxMarkdownState {
  fence: string;
  inner: TxCodeMode | null;
  innerState: unknown;
}

export interface TxMarkdownModes {
  resolve(name: string): TxCodeLanguage | null;
  mode(language: TxCodeLanguage): TxCodeMode;
}

const FENCE = /^\s*(`{3,}|~{3,})\s*([\w+#.-]*).*$/;

function inline(stream: TxCodeStreamLike): TxCodeTokenType | null {
  const char = stream.peek();
  if (char === '\\') {
    stream.next();
    stream.next();
    return null;
  }
  if (char === '`' && stream.match(/(`+)(?:(?!\1).)+?\1|`+.*$/)) {
    return 'code';
  }
  if ((char === '*' || char === '_') && (char === '*' || !/\w/.test(stream.string.charAt(stream.pos - 1)))) {
    if (stream.match(/(\*\*|__)(?=\S)(?:(?!\1).)+?\1/)) {
      return 'strong';
    }
    if (stream.match(/(\*|_)(?=[^\s*_])(?:(?!\1).)+?\1/)) {
      return 'emphasis';
    }
  }
  if ((char === '[' || char === '!') && stream.match(/!?\[[^\]]*\]\([^)]*\)/)) {
    return 'link';
  }
  if (char === '<') {
    if (stream.match(/<!--[\s\S]*?-->/)) {
      return 'comment';
    }
    if (stream.match(/<https?:[^>\s]+>/) ) {
      return 'link';
    }
    if (stream.match(/<\/?[A-Za-z][^>]*>/)) {
      return 'tag';
    }
  }
  if (char === 'h' && stream.match(/https?:\/\/[^\s<>()]+/)) {
    return 'link';
  }
  if (!stream.match(/[^`*_[!<\\h]+/)) {
    stream.next();
  }
  return null;
}

export function createMarkdownMode(modes: TxMarkdownModes): TxCodeMode<TxMarkdownState> {
  function token(stream: TxCodeStreamLike, state: TxMarkdownState): TxCodeTokenType | null {
    if (stream.sol()) {
      const fence = stream.match(FENCE, false);
      if (state.fence) {
        if (fence && fence[1][0] === state.fence[0] && fence[1].length >= state.fence.length && !fence[2]) {
          stream.skipToEnd();
          state.fence = '';
          state.inner = null;
          state.innerState = null;
          return 'string';
        }
      } else if (fence) {
        stream.skipToEnd();
        state.fence = fence[1];
        const language = modes.resolve(fence[2]);
        state.inner = language && language !== 'plain' ? modes.mode(language) : null;
        state.innerState = state.inner?.start() ?? null;
        return 'string';
      } else {
        if (stream.match(/#{1,6}(?=\s|$)/, false)) {
          stream.skipToEnd();
          return 'heading';
        }
        if (stream.match(/\s{0,3}>/, false)) {
          stream.skipToEnd();
          return 'quote';
        }
        if (stream.match(/\s{0,3}([-*_])(?:\s*\1){2,}\s*$/)) {
          return 'keyword';
        }
        if (stream.match(/\s*(?:[*+-]|\d+[.)])(?=\s)/)) {
          return 'keyword';
        }
      }
    }
    if (state.fence) {
      if (!state.inner) {
        stream.skipToEnd();
        return 'code';
      }
      const type = state.inner.token(stream, state.innerState);
      if (stream.pos === stream.start) {
        stream.next();
      }
      return type;
    }
    return inline(stream);
  }

  return {
    language: 'markdown',
    comments: { block: ['<!--', '-->'] },
    start: () => ({ fence: '', inner: null, innerState: null }),
    copy: (state) => ({ ...state, innerState: state.inner ? state.inner.copy(state.innerState) : null }),
    token,
  };
}
