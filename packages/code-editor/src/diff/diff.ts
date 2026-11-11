export interface TxTextRange {
  readonly from: number;
  readonly to: number;
}

export interface TxCodeDiffChange {
  readonly originalFrom: number;
  readonly originalTo: number;
  readonly modifiedFrom: number;
  readonly modifiedTo: number;
  readonly originalRanges: readonly TxTextRange[];
  readonly modifiedRanges: readonly TxTextRange[];
}

export interface TxCodeDiffOptions {
  readonly ignoreTrimWhitespace?: boolean;
  readonly maxCost?: number;
}

type DiffOpType = 'equal' | 'insert' | 'delete';

interface DiffOp {
  type: DiffOpType;
  aFrom: number;
  aTo: number;
  bFrom: number;
  bTo: number;
}

const CHAR_DIFF_LIMIT = 6000;
const CHAR_COST = 400;
const SHORT_EQUAL = 3;

function push(ops: DiffOp[], type: DiffOpType, aFrom: number, aTo: number, bFrom: number, bTo: number): void {
  if (aFrom === aTo && bFrom === bTo) {
    return;
  }
  const last = ops[ops.length - 1];
  if (last && last.type === type && last.aTo === aFrom && last.bTo === bFrom) {
    last.aTo = aTo;
    last.bTo = bTo;
  } else {
    ops.push({ type, aFrom, aTo, bFrom, bTo });
  }
}

function middle<T>(a: readonly T[], aStart: number, aEnd: number, b: readonly T[], bStart: number, bEnd: number, equal: (x: T, y: T) => boolean, maxCost: number, ops: DiffOp[]): void {
  const n = aEnd - aStart;
  const m = bEnd - bStart;
  if (!n || !m) {
    push(ops, 'delete', aStart, aEnd, bStart, bStart);
    push(ops, 'insert', aEnd, aEnd, bStart, bEnd);
    return;
  }
  const max = n + m;
  const offset = max + 1;
  const v = new Int32Array(2 * max + 3);
  const trace: Int32Array[] = [];
  for (let d = 0; d <= max; d++) {
    if (d > maxCost) {
      push(ops, 'delete', aStart, aEnd, bStart, bStart);
      push(ops, 'insert', aEnd, aEnd, bStart, bEnd);
      return;
    }
    trace.push(v.slice(offset - d - 1, offset + d + 2));
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && equal(a[aStart + x], b[bStart + y])) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        backtrack(trace, d, n, m, aStart, bStart, ops);
        return;
      }
    }
  }
}

function backtrack(trace: Int32Array[], depth: number, n: number, m: number, aStart: number, bStart: number, ops: DiffOp[]): void {
  const steps: DiffOp[] = [];
  let x = n;
  let y = m;
  for (let d = depth; d > 0; d--) {
    const row = trace[d];
    const at = (k: number) => row[k + d + 1];
    const k = x - y;
    const previousK = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1;
    const previousX = at(previousK);
    const previousY = previousX - previousK;
    while (x > previousX && y > previousY) {
      steps.push({ type: 'equal', aFrom: aStart + x - 1, aTo: aStart + x, bFrom: bStart + y - 1, bTo: bStart + y });
      x--;
      y--;
    }
    if (x === previousX) {
      steps.push({ type: 'insert', aFrom: aStart + x, aTo: aStart + x, bFrom: bStart + y - 1, bTo: bStart + y });
    } else {
      steps.push({ type: 'delete', aFrom: aStart + x - 1, aTo: aStart + x, bFrom: bStart + y, bTo: bStart + y });
    }
    x = previousX;
    y = previousY;
  }
  while (x > 0 && y > 0) {
    steps.push({ type: 'equal', aFrom: aStart + x - 1, aTo: aStart + x, bFrom: bStart + y - 1, bTo: bStart + y });
    x--;
    y--;
  }
  for (let index = steps.length - 1; index >= 0; index--) {
    const step = steps[index];
    push(ops, step.type, step.aFrom, step.aTo, step.bFrom, step.bTo);
  }
}

export function diffSequences<T>(a: readonly T[], b: readonly T[], equal: (x: T, y: T) => boolean = (x, y) => x === y, maxCost = 2000): DiffOp[] {
  const ops: DiffOp[] = [];
  let start = 0;
  while (start < a.length && start < b.length && equal(a[start], b[start])) {
    start++;
  }
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && equal(a[endA - 1], b[endB - 1])) {
    endA--;
    endB--;
  }
  push(ops, 'equal', 0, start, 0, start);
  middle(a, start, endA, b, start, endB, equal, maxCost, ops);
  push(ops, 'equal', endA, a.length, endB, b.length);
  return ops;
}

function cleanShortEquals(ops: DiffOp[]): DiffOp[] {
  return ops.map((op, index) => {
    const previous = ops[index - 1];
    const next = ops[index + 1];
    if (op.type === 'equal' && previous && next && previous.type !== 'equal' && next.type !== 'equal' && op.aTo - op.aFrom < SHORT_EQUAL) {
      return { ...op, type: 'delete' as const, bTo: op.bFrom, merged: true };
    }
    return op;
  });
}

function charRanges(original: string, modified: string): { original: TxTextRange[]; modified: TxTextRange[] } {
  if (original.length + modified.length > CHAR_DIFF_LIMIT) {
    return { original: original ? [{ from: 0, to: original.length }] : [], modified: modified ? [{ from: 0, to: modified.length }] : [] };
  }
  const ops = cleanShortEquals(diffSequences([...original], [...modified], undefined, CHAR_COST));
  const removed: TxTextRange[] = [];
  const added: TxTextRange[] = [];
  const add = (list: TxTextRange[], from: number, to: number) => {
    if (from >= to) {
      return;
    }
    const last = list[list.length - 1];
    if (last && last.to === from) {
      list[list.length - 1] = { from: last.from, to };
    } else {
      list.push({ from, to });
    }
  };
  for (const op of ops) {
    if (op.type === 'delete') {
      add(removed, op.aFrom, op.aTo);
      if ('merged' in op) {
        add(added, op.bFrom, op.bFrom + (op.aTo - op.aFrom));
      }
    } else if (op.type === 'insert') {
      add(added, op.bFrom, op.bTo);
    }
  }
  return { original: removed, modified: added };
}

function bigrams(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  const trimmed = text.trim();
  for (let index = 0; index < trimmed.length - 1; index++) {
    const pair = trimmed.slice(index, index + 2);
    counts.set(pair, (counts.get(pair) ?? 0) + 1);
  }
  return counts;
}

function similar(a: string, b: string): boolean {
  if (a.trim() === b.trim()) {
    return true;
  }
  const left = bigrams(a);
  const right = bigrams(b);
  let total = 0;
  let shared = 0;
  left.forEach((count, pair) => {
    total += count;
    shared += Math.min(count, right.get(pair) ?? 0);
  });
  right.forEach((count) => (total += count));
  return total > 0 && (2 * shared) / total >= 0.5;
}

function offsets(lines: readonly string[]): number[] {
  const starts: number[] = [];
  let position = 0;
  for (const line of lines) {
    starts.push(position);
    position += line.length + 1;
  }
  return starts;
}

function blockRanges(removed: readonly string[], added: readonly string[]): { original: TxTextRange[]; modified: TxTextRange[] } {
  const original: TxTextRange[] = [];
  const modified: TxTextRange[] = [];
  if (!removed.length || !added.length) {
    return { original, modified };
  }
  const removedStarts = offsets(removed);
  const addedStarts = offsets(added);
  for (const op of diffSequences(removed, added, similar, 200)) {
    if (op.type !== 'equal') {
      continue;
    }
    for (let index = 0; index < op.aTo - op.aFrom; index++) {
      const left = op.aFrom + index;
      const right = op.bFrom + index;
      const ranges = charRanges(removed[left], added[right]);
      original.push(...ranges.original.map((range) => ({ from: range.from + removedStarts[left], to: range.to + removedStarts[left] })));
      modified.push(...ranges.modified.map((range) => ({ from: range.from + addedStarts[right], to: range.to + addedStarts[right] })));
    }
  }
  return { original, modified };
}

export function splitDiffLines(text: string): string[] {
  return text.split(/\r\n?|\n/);
}

export function diffCode(original: string, modified: string, options: TxCodeDiffOptions = {}): TxCodeDiffChange[] {
  const a = splitDiffLines(original);
  const b = splitDiffLines(modified);
  const ignoreTrim = options.ignoreTrimWhitespace ?? true;
  const equal = ignoreTrim ? (x: string, y: string) => x === y || x.trim() === y.trim() : undefined;
  const ops = diffSequences(a, b, equal, options.maxCost ?? 2000);
  const changes: TxCodeDiffChange[] = [];
  let index = 0;
  while (index < ops.length) {
    if (ops[index].type === 'equal') {
      index++;
      continue;
    }
    const first = ops[index];
    let last = first;
    while (index + 1 < ops.length && ops[index + 1].type !== 'equal') {
      last = ops[++index];
    }
    index++;
    const originalFrom = first.aFrom;
    const originalTo = last.aTo;
    const modifiedFrom = first.bFrom;
    const modifiedTo = last.bTo;
    const ranges = blockRanges(a.slice(originalFrom, originalTo), b.slice(modifiedFrom, modifiedTo));
    changes.push({ originalFrom, originalTo, modifiedFrom, modifiedTo, originalRanges: ranges.original, modifiedRanges: ranges.modified });
  }
  return changes;
}

export function rangesByLine(lines: readonly string[], ranges: readonly TxTextRange[]): TxTextRange[][] {
  const result: TxTextRange[][] = lines.map(() => []);
  let lineStart = 0;
  lines.forEach((line, index) => {
    const lineEnd = lineStart + line.length;
    for (const range of ranges) {
      const from = Math.max(range.from, lineStart);
      const to = Math.min(range.to, lineEnd);
      if (from < to) {
        result[index].push({ from: from - lineStart, to: to - lineStart });
      }
    }
    lineStart = lineEnd + 1;
  });
  return result;
}

export function summarizeDiff(changes: readonly TxCodeDiffChange[]): { added: number; removed: number; changes: number } {
  return changes.reduce(
    (summary, change) => ({
      added: summary.added + change.modifiedTo - change.modifiedFrom,
      removed: summary.removed + change.originalTo - change.originalFrom,
      changes: summary.changes + 1,
    }),
    { added: 0, removed: 0, changes: 0 },
  );
}
