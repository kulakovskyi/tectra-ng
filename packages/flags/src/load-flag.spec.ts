import { TX_FLAG_CODES } from './generated/flag-loaders';
import { isTxFlagCode, loadTxFlag, loadTxFlagSvg } from './load-flag';

describe('flags', () => {
  it('knows the ISO codes and the extra regions', () => {
    expect(TX_FLAG_CODES.length).toBeGreaterThan(250);
    expect(isTxFlagCode('UA')).toBe(true);
    expect(isTxFlagCode('gb-eng')).toBe(true);
    expect(isTxFlagCode('zz')).toBe(false);
  });

  it('loads the rectangle and the circle artwork of one flag', async () => {
    const rectangle = await loadTxFlagSvg('ua');
    const circle = await loadTxFlagSvg('UA', 'circle');
    expect(rectangle).toContain('viewBox="0 0 640 480"');
    expect(circle).toContain('viewBox="0 0 512 512"');
  });

  it('returns a cached data URL and null for an unknown code', async () => {
    const first = loadTxFlag('pl');
    expect(loadTxFlag('PL')).toBe(first);
    expect(await first).toMatch(/^data:image\/svg\+xml,/);
    expect(await loadTxFlag('zz')).toBeNull();
  });
});
