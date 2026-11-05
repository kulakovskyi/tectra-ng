import { optionalBoolean } from './optional-boolean';

describe('optionalBoolean', () => {
  it('keeps undefined and null as undefined', () => {
    expect(optionalBoolean(undefined)).toBeUndefined();
    expect(optionalBoolean(null)).toBeUndefined();
  });

  it('treats a bare attribute as true', () => {
    expect(optionalBoolean('')).toBe(true);
    expect(optionalBoolean('false')).toBe(false);
    expect(optionalBoolean(true)).toBe(true);
  });
});
