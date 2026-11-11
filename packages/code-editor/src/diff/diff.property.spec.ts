import fc from 'fast-check';
import { diffCode, diffSequences, splitDiffLines, summarizeDiff } from './diff';

const sequence = fc.array(fc.integer({ min: 0, max: 4 }), { maxLength: 40 });

function longestCommon(a: readonly number[], b: readonly number[]): number {
  const table = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      table[i][j] = a[i - 1] === b[j - 1] ? table[i - 1][j - 1] + 1 : Math.max(table[i - 1][j], table[i][j - 1]);
    }
  }
  return table[a.length][b.length];
}

const code = fc
  .array(fc.constantFrom('const a = 1;', '  return a;', 'if (x) {', '}', '', 'let b = 2;', '// note', '\tb++;', 'a + b'), { maxLength: 30 })
  .map((lines) => lines.join('\n'));

describe('diffSequences properties', () => {
  it('walks both sequences in order and only matches equal items', () => {
    fc.assert(
      fc.property(sequence, sequence, (a, b) => {
        let ai = 0;
        let bi = 0;
        for (const op of diffSequences(a, b)) {
          expect(op.aFrom).toBe(ai);
          expect(op.bFrom).toBe(bi);
          if (op.type === 'equal') {
            expect(a.slice(op.aFrom, op.aTo)).toEqual(b.slice(op.bFrom, op.bTo));
          } else if (op.type === 'delete') {
            expect(op.bTo).toBe(op.bFrom);
          } else {
            expect(op.aTo).toBe(op.aFrom);
          }
          ai = op.aTo;
          bi = op.bTo;
        }
        expect(ai).toBe(a.length);
        expect(bi).toBe(b.length);
      }),
    );
  });

  it('finds a shortest edit script', () => {
    fc.assert(
      fc.property(sequence, sequence, (a, b) => {
        const edits = diffSequences(a, b)
          .filter((op) => op.type !== 'equal')
          .reduce((sum, op) => sum + (op.aTo - op.aFrom) + (op.bTo - op.bFrom), 0);
        expect(edits).toBe(a.length + b.length - 2 * longestCommon(a, b));
      }),
    );
  });

  it('stays a valid script when the cost limit cuts the search short', () => {
    fc.assert(
      fc.property(sequence, sequence, fc.integer({ min: 0, max: 3 }), (a, b, maxCost) => {
        const rebuilt: number[] = [];
        for (const op of diffSequences(a, b, undefined, maxCost)) {
          rebuilt.push(...b.slice(op.bFrom, op.bTo));
        }
        expect(rebuilt).toEqual(b);
      }),
    );
  });
});

describe('diffCode properties', () => {
  it('reports no change for the same text', () => {
    fc.assert(
      fc.property(code, (text) => {
        expect(diffCode(text, text)).toEqual([]);
      }),
    );
  });

  it('keeps changes ordered, inside both texts, with the lines between them equal', () => {
    fc.assert(
      fc.property(code, code, fc.boolean(), (original, modified, ignoreTrimWhitespace) => {
        const a = splitDiffLines(original);
        const b = splitDiffLines(modified);
        const same = (x: string, y: string) => x === y || (ignoreTrimWhitespace && x.trim() === y.trim());
        const changes = diffCode(original, modified, { ignoreTrimWhitespace });
        let ai = 0;
        let bi = 0;
        for (const change of changes) {
          expect(change.originalFrom - ai).toBe(change.modifiedFrom - bi);
          for (let offset = 0; offset < change.originalFrom - ai; offset++) {
            expect(same(a[ai + offset], b[bi + offset])).toBe(true);
          }
          expect(change.originalTo).toBeGreaterThanOrEqual(change.originalFrom);
          expect(change.modifiedTo).toBeGreaterThanOrEqual(change.modifiedFrom);
          const removedLength = a.slice(change.originalFrom, change.originalTo).join('\n').length;
          const addedLength = b.slice(change.modifiedFrom, change.modifiedTo).join('\n').length;
          expect(change.originalRanges.every((range) => range.from < range.to && range.to <= removedLength)).toBe(true);
          expect(change.modifiedRanges.every((range) => range.from < range.to && range.to <= addedLength)).toBe(true);
          ai = change.originalTo;
          bi = change.modifiedTo;
        }
        expect(a.length - ai).toBe(b.length - bi);
        for (let offset = 0; offset < a.length - ai; offset++) {
          expect(same(a[ai + offset], b[bi + offset])).toBe(true);
        }
        const summary = summarizeDiff(changes);
        expect(summary.changes).toBe(changes.length);
        expect(a.length - summary.removed).toBe(b.length - summary.added);
      }),
    );
  });
});
