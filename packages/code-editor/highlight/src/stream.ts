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

export class TxCodeStream implements TxCodeStreamLike {
  pos = 0;
  start = 0;

  constructor(readonly string: string) {}

  eol(): boolean {
    return this.pos >= this.string.length;
  }

  sol(): boolean {
    return this.pos === 0;
  }

  peek(offset = 0): string {
    return this.string.charAt(this.pos + offset);
  }

  next(): string {
    return this.pos < this.string.length ? this.string.charAt(this.pos++) : '';
  }

  eat(match: string | RegExp): string {
    const char = this.peek();
    if (char && (typeof match === 'string' ? char === match : match.test(char))) {
      this.pos++;
      return char;
    }
    return '';
  }

  eatWhile(match: RegExp): boolean {
    const start = this.pos;
    while (this.eat(match));
    return this.pos > start;
  }

  eatSpace(): boolean {
    return this.eatWhile(/\s/);
  }

  skipToEnd(): void {
    this.pos = this.string.length;
  }

  skipTo(text: string): boolean {
    const index = this.string.indexOf(text, this.pos);
    if (index < 0) {
      return false;
    }
    this.pos = index;
    return true;
  }

  match(pattern: RegExp, consume = true): RegExpExecArray | null {
    const compiled = sticky(pattern);
    compiled.lastIndex = this.pos;
    const found = compiled.exec(this.string);
    if (found && consume) {
      this.pos += found[0].length;
    }
    return found;
  }

  matchText(text: string, consume = true, ignoreCase = false): boolean {
    const slice = this.string.substr(this.pos, text.length);
    const same = ignoreCase ? slice.toLowerCase() === text.toLowerCase() : slice === text;
    if (same && consume) {
      this.pos += text.length;
    }
    return same;
  }

  current(): string {
    return this.string.slice(this.start, this.pos);
  }

  rest(): string {
    return this.string.slice(this.pos);
  }

  before(): string {
    return this.string.slice(0, this.start);
  }
}

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
