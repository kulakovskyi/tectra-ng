import { diffCode, diffSequences, rangesByLine, summarizeDiff } from './diff';
import { diffDocument, inlineRows, markedSegments, splitRows } from './diff-rows';

describe('diffCode', () => {
  it('finds nothing in equal texts', () => {
    expect(diffCode('a\nb', 'a\nb')).toEqual([]);
  });

  it('finds added, removed and changed lines', () => {
    const changes = diffCode('one\ntwo\nthree\nfour', 'one\n2\nthree\nfour\nfive');
    expect(changes.map(({ originalFrom, originalTo, modifiedFrom, modifiedTo }) => [originalFrom, originalTo, modifiedFrom, modifiedTo])).toEqual([
      [1, 2, 1, 2],
      [4, 4, 4, 5],
    ]);
    expect(summarizeDiff(changes)).toEqual({ added: 2, removed: 1, changes: 2 });
  });

  it('marks the changed characters inside a changed line', () => {
    const [change] = diffCode('const total = 10;', 'const sum = 10;');
    expect(change.originalRanges).toEqual([{ from: 6, to: 11 }]);
    expect(change.modifiedRanges).toEqual([{ from: 6, to: 9 }]);
  });

  it('ignores spaces at the line ends unless asked', () => {
    expect(diffCode('a\n  b', 'a\nb  ')).toEqual([]);
    expect(diffCode('a\n  b', 'a\nb  ', { ignoreTrimWhitespace: false })).toHaveLength(1);
  });

  it('falls back to one block when the texts are too different', () => {
    const ops = diffSequences([...'abcdef'], [...'uvwxyz'], undefined, 2);
    expect(ops.map((op) => op.type)).toEqual(['delete', 'insert']);
  });

  it('finds the shortest edit', () => {
    const ops = diffSequences([...'ABCABBA'], [...'CBABAC']);
    const edits = ops.filter((op) => op.type !== 'equal').reduce((sum, op) => sum + (op.aTo - op.aFrom) + (op.bTo - op.bFrom), 0);
    expect(edits).toBe(5);
  });
});

describe('diff rows', () => {
  it('splits block ranges by line', () => {
    expect(rangesByLine(['abc', 'de'], [{ from: 2, to: 5 }])).toEqual([[{ from: 2, to: 3 }], [{ from: 0, to: 1 }]]);
  });

  it('cuts segments at tokens and marks', () => {
    const segments = markedSegments('let a', [{ from: 0, to: 3, type: 'keyword' }], [{ from: 1, to: 5 }], 'mark');
    expect(segments).toEqual([
      { text: 'l', className: 'tx-code-tok-keyword' },
      { text: 'et', className: 'tx-code-tok-keyword mark' },
      { text: ' a', className: 'mark' },
    ]);
  });

  it('lays out inline and side by side rows', () => {
    const original = diffDocument('a\nb\nc', 'plain');
    const modified = diffDocument('a\nB\nB2\nc', 'plain');
    const changes = diffCode('a\nb\nc', 'a\nB\nB2\nc');
    expect(inlineRows(original, modified, changes).map((row) => `${row.kind}:${row.number ?? ''}`)).toEqual([
      'equal:1',
      'removed:',
      'inserted:2',
      'inserted:3',
      'equal:4',
    ]);
    const split = splitRows(original, modified, changes);
    expect(split.original.map((row) => row.kind)).toEqual(['equal', 'removed', 'filler', 'equal']);
    expect(split.modified.map((row) => row.kind)).toEqual(['equal', 'inserted', 'inserted', 'equal']);
  });
});
