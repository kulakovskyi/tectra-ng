import { encodeQr } from './encoder';
import { qrPaths } from './paths';

describe('qrPaths', () => {
  const matrix = encodeQr('HELLO WORLD', { errorCorrection: 'Q', mask: 2 });

  it('draws three eyes apart from the dots in every style', () => {
    for (const dotStyle of ['square', 'dots', 'rounded', 'soft'] as const) {
      const paths = qrPaths(matrix, { dotStyle, eyeFrameStyle: 'rounded', eyeBallStyle: 'circle' });
      expect(paths.eyes).toEqual([
        { x: 0, y: 0 },
        { x: matrix.size - 7, y: 0 },
        { x: 0, y: matrix.size - 7 },
      ]);
      expect(paths.dots.length).toBeGreaterThan(0);
      expect(paths.eyeFrames.split('M')).toHaveLength(7);
    }
  });

  it('leaves the logo area empty', () => {
    const full = qrPaths(matrix, { dotStyle: 'dots', eyeFrameStyle: 'square', eyeBallStyle: 'square' });
    const cleared = qrPaths(matrix, { dotStyle: 'dots', eyeFrameStyle: 'square', eyeBallStyle: 'square', clearSize: 7 });
    expect(cleared.dots.split('M').length).toBeLessThan(full.dots.split('M').length);
  });
});
