import { TxNumberFormat } from './number-format';

describe('TxNumberFormat', () => {
  it('formats and parses decimals with the locale separators', () => {
    const us = new TxNumberFormat({ locale: 'en-US', mode: 'decimal', useGrouping: true });
    expect(us.format(1234567.891)).toBe('1,234,567.891');
    expect(us.formatTyping('1234567.8')).toEqual({ display: '1,234,567.8', value: 1234567.8 });
    const ua = new TxNumberFormat({ locale: 'uk-UA', mode: 'decimal', useGrouping: true, maxFractionDigits: 2 });
    expect(ua.formatTyping('1234.567').display).toBe('1 234,56');
    expect(ua.parse('1 234,5')).toBe(1234.5);
  });

  it('places currency symbols per locale and keeps the sign in front', () => {
    const usd = new TxNumberFormat({ locale: 'en-US', mode: 'currency', currency: 'USD', useGrouping: true });
    expect(usd.format(-1234.5)).toBe('-$1,234.50');
    expect(usd.formatTyping('$12').display).toBe('$12');
    const uah = new TxNumberFormat({ locale: 'uk-UA', mode: 'currency', currency: 'UAH', useGrouping: true });
    expect(uah.format(1234.5)).toMatch(/^1\s234,50\s₴$/);
    expect(uah.parse(uah.format(1234.5))).toBe(1234.5);
  });

  it('adds own prefix and suffix and counts digits for the caret', () => {
    const format = new TxNumberFormat({ locale: 'en-US', mode: 'decimal', useGrouping: true, suffix: ' kg', prefix: '~' });
    const display = format.format(12345);
    expect(display).toBe('~12,345 kg');
    expect(format.countBefore(display, 4)).toBe(2);
    expect(format.caretFor(display, 2)).toBe(3);
    expect(format.caretFor(display, 0)).toBe(1);
  });

  it('drops the decimal separator when no fraction is allowed', () => {
    const integer = new TxNumberFormat({ locale: 'en-US', mode: 'decimal', useGrouping: false, maxFractionDigits: 0 });
    expect(integer.formatTyping('12.5')).toEqual({ display: '125', value: 125 });
  });
});
