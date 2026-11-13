import { TxCodeLanguage, TxCodeMode, TxCodeToken, TxCodeTokenType } from './code-highlight.types';
import { TX_CSS_MODE } from './languages/css';
import { TX_HTML_MODE } from './languages/html';
import { TX_JAVASCRIPT_MODE, TX_TYPESCRIPT_MODE } from './languages/javascript';
import { TX_JSON_MODE } from './languages/json';
import { createMarkdownMode } from './languages/markdown';
import { TxCodeStream } from './stream';

const ALIASES: Record<string, TxCodeLanguage> = {
  html: 'html',
  htm: 'html',
  xhtml: 'html',
  xml: 'html',
  svg: 'html',
  vue: 'html',
  css: 'css',
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  jsonc: 'json',
  json5: 'json',
  markdown: 'markdown',
  md: 'markdown',
  plain: 'plain',
  plaintext: 'plain',
  text: 'plain',
  txt: 'plain',
};

/** Resolves a language name or alias (`js`, `ts`, `md`) to a language; `null` for an unknown name. */
export function resolveCodeLanguage(name: string | null | undefined): TxCodeLanguage | null {
  return name ? (ALIASES[name.trim().toLowerCase()] ?? null) : null;
}

const PLAIN_MODE: TxCodeMode<null> = {
  language: 'plain',
  comments: {},
  start: () => null,
  copy: () => null,
  token: (stream) => {
    stream.skipToEnd();
    return null;
  },
};

const MARKDOWN_MODE = createMarkdownMode({ resolve: resolveCodeLanguage, mode: getCodeMode });

const MODES: Record<TxCodeLanguage, TxCodeMode> = {
  html: TX_HTML_MODE as TxCodeMode,
  css: TX_CSS_MODE as TxCodeMode,
  javascript: TX_JAVASCRIPT_MODE as TxCodeMode,
  typescript: TX_TYPESCRIPT_MODE as TxCodeMode,
  json: TX_JSON_MODE as TxCodeMode,
  markdown: MARKDOWN_MODE as TxCodeMode,
  plain: PLAIN_MODE as TxCodeMode,
};

/** Gives the tokenizer of a language name; unknown names get the plain one. */
export function getCodeMode(language: TxCodeLanguage | string | null | undefined): TxCodeMode {
  return MODES[resolveCodeLanguage(language) ?? 'plain'];
}

/** Tokens of one line, read with a mode and the state carried over from the lines before. */
export function tokenizeLine(mode: TxCodeMode, text: string, state: unknown): TxCodeToken[] {
  const stream = new TxCodeStream(text);
  const tokens: TxCodeToken[] = [];
  while (!stream.eol()) {
    stream.start = stream.pos;
    const type = mode.token(stream, state);
    if (stream.pos <= stream.start) {
      stream.pos = stream.start + 1;
    }
    if (type) {
      pushToken(tokens, stream.start, stream.pos, type);
    }
  }
  return tokens;
}

function pushToken(tokens: TxCodeToken[], from: number, to: number, type: TxCodeTokenType): void {
  const last = tokens[tokens.length - 1];
  if (last && last.type === type && last.to === from) {
    tokens[tokens.length - 1] = { from: last.from, to, type };
  } else {
    tokens.push({ from, to, type });
  }
}

/** Splits code into lines at `\n`, `\r\n` or `\r`. */
export function splitCodeLines(code: string): string[] {
  return code.split(/\r\n?|\n/);
}

/** Tokens of every line of the code in the given language (default `plain`). */
export function highlightCode(code: string, language: TxCodeLanguage | string = 'plain'): TxCodeToken[][] {
  const mode = getCodeMode(language);
  const state = mode.start();
  return splitCodeLines(code).map((line) => tokenizeLine(mode, line, state));
}

/** Caches the tokenizer state at the start of each line, so an editor can re-highlight only what changed. */
export class TxCodeLineStates {
  private readonly states: unknown[];

  constructor(private readonly mode: TxCodeMode) {
    this.states = [mode.start()];
  }

  /** The language of the mode. */
  get language(): TxCodeLanguage {
    return this.mode.language;
  }

  /** Forgets the stored states after the given line; call it when that line or a line above changes. */
  invalidateFrom(line: number): void {
    if (this.states.length > line + 1) {
      this.states.length = Math.max(1, line + 1);
    }
  }

  /** Tokens of a line; `lineText` supplies the text of any line, read on demand to catch up the states. */
  tokens(line: number, lineText: (line: number) => string): TxCodeToken[] {
    while (this.states.length <= line) {
      const index = this.states.length - 1;
      const state = this.mode.copy(this.states[index]);
      tokenizeLine(this.mode, lineText(index), state);
      this.states.push(state);
    }
    return tokenizeLine(this.mode, lineText(line), this.mode.copy(this.states[line]));
  }
}
