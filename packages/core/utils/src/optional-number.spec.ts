import { optionalNumber } from './optional-number';

describe('optionalNumber', () => {
  it('keeps numbers and numeric strings, turns empty values into undefined', () => {
    expect(optionalNumber(5)).toBe(5);
    expect(optionalNumber('2.5')).toBe(2.5);
    expect(optionalNumber(undefined)).toBeUndefined();
    expect(optionalNumber(null)).toBeUndefined();
    expect(optionalNumber('')).toBeUndefined();
    expect(optionalNumber('abc')).toBeUndefined();
  });
});
