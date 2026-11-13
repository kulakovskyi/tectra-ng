import { TxCodeStreamLike } from './code-highlight.types';

const STICKY = new WeakMap<RegExp, RegExp>();

function sticky(pattern: RegExp): RegExp {
  let compiled = STICKY.get(pattern);
  if (!compiled) {
    compiled = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '') + 'y');
    STICKY.set(pattern, compiled);
  }
  return compiled;
}

/** Default cursor over one line of code, used by the tokenizers. */
export class TxCodeStream implements TxCodeStreamLike {
  /** Current offset in the line. */
  pos = 0;
  /** Offset where the token being read began. */
  start = 0;

  /** The whole line. */
  constructor(
    /** The line being read. */
    readonly string: string,
  ) {}

  /** Whether the cursor is at the end of the line. */
  eol(): boolean {
    return this.pos >= this.string.length;
  }

  /** Whether the cursor is at the start of the line. */
  sol(): boolean {
    return this.pos === 0;
  }

  /** Returns the character at `offset` from the cursor (default 0) without moving; empty past the end. */
  peek(offset = 0): string {
    return this.string.charAt(this.pos + offset);
  }

  /** Moves one character on and returns it; empty at the end. */
  next(): string {
    return this.pos < this.string.length ? this.string.charAt(this.pos++) : '';
  }

  /**
   * Moves past the next character when it equals a string or fits a pattern, and returns it; empty otherwise.
   */
  eat(match: string | RegExp): string {
    const char = this.peek();
    if (char && (typeof match === 'string' ? char === match : match.test(char))) {
      this.pos++;
      return char;
    }
    return '';
  }

  /** Moves past characters while they fit the pattern; `true` when it moved. */
  eatWhile(match: RegExp): boolean {
    const start = this.pos;
    while (this.eat(match));
    return this.pos > start;
  }

  /** Moves past whitespace; `true` when it moved. */
  eatSpace(): boolean {
    return this.eatWhile(/\s/);
  }

  /** Moves to the end of the line. */
  skipToEnd(): void {
    this.pos = this.string.length;
  }

  /** Moves to the next occurrence of the text without consuming it; `false` when there is none. */
  skipTo(text: string): boolean {
    const index = this.string.indexOf(text, this.pos);
    if (index < 0) {
      return false;
    }
    this.pos = index;
    return true;
  }

  /** Matches a pattern at the cursor and returns the match, moving past it unless `consume` is `false`. */
  match(pattern: RegExp, consume = true): RegExpExecArray | null {
    const compiled = sticky(pattern);
    compiled.lastIndex = this.pos;
    const found = compiled.exec(this.string);
    if (found && consume) {
      this.pos += found[0].length;
    }
    return found;
  }

  /**
   * Checks that the text follows the cursor, moving past it unless `consume` is `false`; `ignoreCase` ignores case.
   */
  matchText(text: string, consume = true, ignoreCase = false): boolean {
    const slice = this.string.substr(this.pos, text.length);
    const same = ignoreCase ? slice.toLowerCase() === text.toLowerCase() : slice === text;
    if (same && consume) {
      this.pos += text.length;
    }
    return same;
  }

  /** Text of the token read so far, from `start` to `pos`. */
  current(): string {
    return this.string.slice(this.start, this.pos);
  }

  /** Text from the cursor to the end of the line. */
  rest(): string {
    return this.string.slice(this.pos);
  }

  /** Text of the line before the current token. */
  before(): string {
    return this.string.slice(0, this.start);
  }
}

/**
 * Runs a reader on the part of the line before `end`, then moves the stream to where the reader stopped; used by modes that embed another language.
 */
export function tokenInside<S>(
  stream: TxCodeStreamLike,
  end: number,
  run: (inner: TxCodeStreamLike) => S,
): S {
  const inner = new TxCodeStream(stream.string.slice(0, end));
  inner.pos = stream.pos;
  inner.start = stream.pos;
  const result = run(inner);
  stream.pos = inner.pos;
  return result;
}
