import fc from 'fast-check';
import { TxQrErrorCorrection, TxQrMatrix } from './types';
import { TxQrCapacityError, encodeQr } from './encoder';

const LEVELS: TxQrErrorCorrection[] = ['L', 'M', 'Q', 'H'];

const texts = fc.oneof(
  fc.string({ unit: 'binary', maxLength: 160 }),
  fc.string({ unit: 'grapheme', maxLength: 80 }),
  fc.stringMatching(/^[0-9]{0,400}$/),
  fc.stringMatching(/^[A-Z0-9 $%*+\-./:]{0,300}$/),
);

function finderIntact(matrix: TxQrMatrix, top: number, left: number): boolean {
  for (let row = 0; row < 7; row++) {
    for (let column = 0; column < 7; column++) {
      const ring = row === 0 || row === 6 || column === 0 || column === 6;
      const core = row >= 2 && row <= 4 && column >= 2 && column <= 4;
      if (matrix.modules[top + row][left + column] !== (ring || core)) {
        return false;
      }
    }
  }
  return true;
}

describe('encodeQr properties', () => {
  it('builds a square matrix of the version size with intact finder patterns for any text', () => {
    fc.assert(
      fc.property(texts, fc.constantFrom(...LEVELS), (text, errorCorrection) => {
        const matrix = encodeQr(text, { errorCorrection });
        expect(matrix.version).toBeGreaterThanOrEqual(1);
        expect(matrix.version).toBeLessThanOrEqual(40);
        expect(matrix.size).toBe(17 + 4 * matrix.version);
        expect(matrix.modules).toHaveLength(matrix.size);
        expect(matrix.modules.every((row) => row.length === matrix.size)).toBe(true);
        expect(matrix.mask).toBeGreaterThanOrEqual(0);
        expect(matrix.mask).toBeLessThanOrEqual(7);
        expect(finderIntact(matrix, 0, 0)).toBe(true);
        expect(finderIntact(matrix, 0, matrix.size - 7)).toBe(true);
        expect(finderIntact(matrix, matrix.size - 7, 0)).toBe(true);
      }),
      { numRuns: 150 },
    );
  });

  it('is deterministic and keeps a requested mask', () => {
    fc.assert(
      fc.property(texts, fc.integer({ min: 0, max: 7 }), (text, mask) => {
        const matrix = encodeQr(text, { mask });
        expect(matrix.mask).toBe(mask);
        expect(encodeQr(text, { mask })).toEqual(matrix);
      }),
      { numRuns: 60 },
    );
  });

  it('never picks a lower error correction than requested when boosting', () => {
    fc.assert(
      fc.property(texts, fc.constantFrom(...LEVELS), (text, errorCorrection) => {
        const matrix = encodeQr(text, { errorCorrection, boostErrorCorrection: true });
        expect(LEVELS.indexOf(matrix.errorCorrection)).toBeGreaterThanOrEqual(LEVELS.indexOf(errorCorrection));
        expect(matrix.version).toBe(encodeQr(text, { errorCorrection }).version);
      }),
      { numRuns: 60 },
    );
  });

  it('either fits a long text or throws the capacity error', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'grapheme-ascii', minLength: 1500, maxLength: 4000 }), fc.constantFrom(...LEVELS), (text, errorCorrection) => {
        try {
          expect(encodeQr(text, { errorCorrection }).version).toBeGreaterThan(1);
        } catch (error) {
          expect(error).toBeInstanceOf(TxQrCapacityError);
        }
      }),
      { numRuns: 20 },
    );
  });
});
