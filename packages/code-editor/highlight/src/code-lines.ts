import { TxCodeLanguage, TxCodeToken } from './code-highlight.types';
import { highlightCode, splitCodeLines } from './tokenize';

export interface TxCodeSegment {
  readonly text: string;
  readonly className: string | null;
}

export interface TxCodeLine {
  readonly number: number;
  readonly segments: readonly TxCodeSegment[];
  readonly indent: string | null;
  readonly guides: number;
}

function indentWidth(text: string, tabSize: number): number | null {
  let columns = 0;
  for (const char of text) {
    if (char === ' ') {
      columns++;
    } else if (char === '\t') {
      columns += tabSize - (columns % tabSize);
    } else {
      return columns;
    }
  }
  return null;
}

export function guideLevels(count: number, lineText: (index: number) => string, tabSize = 4, from = 0, to = count, reach = 200): number[] {
  const width = (index: number) => indentWidth(lineText(index), tabSize);
  const nearest = (index: number, step: 1 | -1): number => {
    for (let other = index + step, seen = 0; other >= 0 && other < count && seen < reach; other += step, seen++) {
      const value = width(other);
      if (value !== null) {
        return value;
      }
    }
    return 0;
  };
  const levels: number[] = [];
  for (let index = from; index < to; index++) {
    const own = width(index);
    const columns = own ?? Math.min(nearest(index, -1), nearest(index, 1));
    levels.push(Math.ceil(columns / tabSize));
  }
  return levels;
}

export function lineIndent(text: string, tabSize = 4): string | null {
  let columns = 0;
  let index = 0;
  for (; index < text.length; index++) {
    const char = text[index];
    if (char === ' ') {
      columns++;
    } else if (char === '\t') {
      columns += tabSize - (columns % tabSize);
    } else {
      break;
    }
  }
  return columns > 0 && index < text.length ? `${columns}ch` : null;
}

export function tokenClass(type: string): string {
  return `tx-code-tok-${type}`;
}

export function lineSegments(text: string, tokens: readonly TxCodeToken[]): TxCodeSegment[] {
  const segments: TxCodeSegment[] = [];
  let position = 0;
  for (const token of tokens) {
    if (token.from > position) {
      segments.push({ text: text.slice(position, token.from), className: null });
    }
    segments.push({ text: text.slice(token.from, token.to), className: tokenClass(token.type) });
    position = token.to;
  }
  if (position < text.length) {
    segments.push({ text: text.slice(position), className: null });
  }
  return segments;
}

export function codeLines(code: string, language: TxCodeLanguage | string, firstLine = 1, tabSize = 4): TxCodeLine[] {
  const texts = splitCodeLines(code);
  const guides = guideLevels(texts.length, (index) => texts[index], tabSize);
  return highlightCode(code, language).map((tokens, index) => ({
    number: firstLine + index,
    segments: lineSegments(texts[index], tokens),
    indent: lineIndent(texts[index], tabSize),
    guides: guides[index],
  }));
}
