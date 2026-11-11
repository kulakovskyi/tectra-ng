import { TxCodeSegment, TxCodeToken, guideLevels, highlightCode, lineIndent, tokenClass } from '@tectra-ng/code-editor/highlight';
import { detectTabSize } from '../engine/commands';
import { TxCodeDiffChange, TxTextRange, rangesByLine, splitDiffLines } from './diff';

export type TxDiffRowKind = 'equal' | 'inserted' | 'removed' | 'filler';

export interface TxDiffRow {
  readonly kind: TxDiffRowKind;
  readonly number: number | null;
  readonly segments: readonly TxCodeSegment[];
  readonly indent: string | null;
  readonly guides: number;
}

export interface TxDiffDocument {
  readonly lines: readonly string[];
  readonly tokens: readonly (readonly TxCodeToken[])[];
  readonly guides: readonly number[];
  readonly tabSize: number;
}

export const TX_DIFF_INSERTED_TEXT = 'tx-code-diff__text--inserted';
export const TX_DIFF_REMOVED_TEXT = 'tx-code-diff__text--removed';

export function diffDocument(text: string, language: string): TxDiffDocument {
  const lines = splitDiffLines(text);
  const tabSize = detectTabSize(text);
  return { lines, tokens: highlightCode(text, language), guides: guideLevels(lines.length, (index) => lines[index], tabSize), tabSize };
}

export function markedSegments(text: string, tokens: readonly TxCodeToken[], marks: readonly TxTextRange[], markClass: string): TxCodeSegment[] {
  const cuts = new Set<number>([0, text.length]);
  tokens.forEach((token) => cuts.add(token.from).add(token.to));
  marks.forEach((mark) => cuts.add(mark.from).add(mark.to));
  const points = [...cuts].filter((point) => point >= 0 && point <= text.length).sort((a, b) => a - b);
  const segments: TxCodeSegment[] = [];
  for (let index = 0; index < points.length - 1; index++) {
    const from = points[index];
    const to = points[index + 1];
    const token = tokens.find((item) => item.from <= from && item.to >= to);
    const marked = marks.some((mark) => mark.from <= from && mark.to >= to);
    const classes = [token ? tokenClass(token.type) : '', marked ? markClass : ''].filter(Boolean).join(' ');
    segments.push({ text: text.slice(from, to), className: classes || null });
  }
  return segments;
}

function blockRows(
  document: TxDiffDocument,
  from: number,
  to: number,
  ranges: readonly TxTextRange[],
  kind: 'inserted' | 'removed',
  numbered: boolean,
): TxDiffRow[] {
  const lines = document.lines.slice(from, to);
  const marks = rangesByLine(lines, ranges);
  const markClass = kind === 'inserted' ? TX_DIFF_INSERTED_TEXT : TX_DIFF_REMOVED_TEXT;
  return lines.map((line, index) => ({
    kind,
    number: numbered ? from + index + 1 : null,
    segments: markedSegments(line, document.tokens[from + index] ?? [], marks[index], markClass),
    indent: lineIndent(line),
    guides: document.guides[from + index] ?? 0,
  }));
}

function equalRow(document: TxDiffDocument, index: number): TxDiffRow {
  return {
    kind: 'equal',
    number: index + 1,
    segments: markedSegments(document.lines[index], document.tokens[index] ?? [], [], ''),
    indent: lineIndent(document.lines[index]),
    guides: document.guides[index] ?? 0,
  };
}

function filler(count: number): TxDiffRow[] {
  return Array.from({ length: count }, () => ({ kind: 'filler' as const, number: null, segments: [], indent: null, guides: 0 }));
}

export function inlineRows(original: TxDiffDocument, modified: TxDiffDocument, changes: readonly TxCodeDiffChange[]): TxDiffRow[] {
  const rows: TxDiffRow[] = [];
  let line = 0;
  for (const change of changes) {
    while (line < change.modifiedFrom) {
      rows.push(equalRow(modified, line++));
    }
    rows.push(...blockRows(original, change.originalFrom, change.originalTo, change.originalRanges, 'removed', false));
    rows.push(...blockRows(modified, change.modifiedFrom, change.modifiedTo, change.modifiedRanges, 'inserted', true));
    line = change.modifiedTo;
  }
  while (line < modified.lines.length) {
    rows.push(equalRow(modified, line++));
  }
  return rows;
}

export function splitRows(original: TxDiffDocument, modified: TxDiffDocument, changes: readonly TxCodeDiffChange[]): { original: TxDiffRow[]; modified: TxDiffRow[] } {
  const left: TxDiffRow[] = [];
  const right: TxDiffRow[] = [];
  let a = 0;
  let b = 0;
  for (const change of changes) {
    while (a < change.originalFrom && b < change.modifiedFrom) {
      left.push(equalRow(original, a++));
      right.push(equalRow(modified, b++));
    }
    const removed = blockRows(original, change.originalFrom, change.originalTo, change.originalRanges, 'removed', true);
    const inserted = blockRows(modified, change.modifiedFrom, change.modifiedTo, change.modifiedRanges, 'inserted', true);
    left.push(...removed, ...filler(Math.max(0, inserted.length - removed.length)));
    right.push(...inserted, ...filler(Math.max(0, removed.length - inserted.length)));
    a = change.originalTo;
    b = change.modifiedTo;
  }
  while (a < original.lines.length || b < modified.lines.length) {
    left.push(a < original.lines.length ? equalRow(original, a++) : filler(1)[0]);
    right.push(b < modified.lines.length ? equalRow(modified, b++) : filler(1)[0]);
  }
  return { original: left, modified: right };
}
