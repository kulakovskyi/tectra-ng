import { formatBytes } from './format-bytes';

describe('formatBytes', () => {
  it('picks the largest unit and names it in the locale', () => {
    expect(formatBytes(512)).toBe('512 byte');
    expect(formatBytes(1536)).toBe('1.5 kB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
    expect(formatBytes(1.25 * 1024 ** 3, { decimals: 2 })).toBe('1.25 GB');
    expect(formatBytes(1500, { base: 1000 })).toBe('1.5 kB');
    expect(formatBytes(1024 ** 6)).toBe('1,024 PB');
    expect(formatBytes(-5)).toBe('0 byte');
    expect(formatBytes(1536, { locale: 'uk-UA' })).toBe(new Intl.NumberFormat('uk-UA', { style: 'unit', unit: 'kilobyte', unitDisplay: 'short' }).format(1.5));
  });
});
