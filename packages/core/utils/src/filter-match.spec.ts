import { isFilled, matchesRule, resolveField } from './filter-match';

describe('resolveField', () => {
  it('reads nested values by a dotted path', () => {
    expect(resolveField({ a: { b: 3 } }, 'a.b')).toBe(3);
    expect(resolveField({ a: null }, 'a.b')).toBeUndefined();
    expect(resolveField(null, 'a')).toBeUndefined();
    expect(resolveField({ a: 1 }, undefined)).toBeUndefined();
  });
});

describe('isFilled', () => {
  it('tells set values from empty ones', () => {
    expect(isFilled(null)).toBe(false);
    expect(isFilled('  ')).toBe(false);
    expect(isFilled([])).toBe(false);
    expect(isFilled([1])).toBe(true);
    expect(isFilled(0)).toBe(true);
  });
});

describe('matchesRule', () => {
  it('matches text ignoring case and accents', () => {
    expect(matchesRule('Café', { value: 'cafe', matchMode: 'equals' })).toBe(true);
    expect(matchesRule('Café table', { value: 'TAB', matchMode: 'contains' })).toBe(true);
    expect(matchesRule('Café table', { value: 'caf', matchMode: 'startsWith' })).toBe(true);
    expect(matchesRule('Café table', { value: 'ble', matchMode: 'endsWith' })).toBe(true);
    expect(matchesRule('Lamp', { value: 'x', matchMode: 'notContains' })).toBe(true);
    expect(matchesRule('Lamp', { value: 'lamp', matchMode: 'notEquals' })).toBe(false);
    expect(matchesRule('Lamp', { value: '', matchMode: 'equals' })).toBe(true);
    expect(matchesRule(null, { value: 'x', matchMode: 'contains' })).toBe(false);
    expect(matchesRule('x', { value: ['x'], matchMode: 'startsWith' })).toBe(true);
  });

  it('compares typed values with equals and not equals', () => {
    expect(matchesRule(true, { value: true, matchMode: 'equals' })).toBe(true);
    expect(matchesRule('12', { value: 12, matchMode: 'equals' })).toBe(true);
    expect(matchesRule(12, { value: 13, matchMode: 'notEquals' })).toBe(true);
    expect(matchesRule(false, { value: false, matchMode: 'notEquals' })).toBe(false);
    expect(matchesRule('2026-01-05T00:00:00', { value: new Date(2026, 0, 5), matchMode: 'equals' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 6), { value: new Date(2026, 0, 5), matchMode: 'notEquals' })).toBe(true);
  });

  it('matches lists', () => {
    expect(matchesRule('wood', { value: ['wood', 'glass'], matchMode: 'in' })).toBe(true);
    expect(matchesRule(null, { value: [null], matchMode: 'in' })).toBe(true);
    expect(matchesRule(null, { value: ['wood'], matchMode: 'in' })).toBe(false);
    expect(matchesRule('Wood', { value: ['WOOD'], matchMode: 'in' })).toBe(true);
    expect(matchesRule('wood', { value: 'wood', matchMode: 'in' })).toBe(false);
  });

  it('compares numbers, text and dates in range rules', () => {
    expect(matchesRule(30, { value: 45, matchMode: 'lt' })).toBe(true);
    expect(matchesRule(45, { value: 45, matchMode: 'lte' })).toBe(true);
    expect(matchesRule(210, { value: 200, matchMode: 'gt' })).toBe(true);
    expect(matchesRule(null, { value: 1, matchMode: 'gt' })).toBe(false);
    expect(matchesRule(10, { value: 10, matchMode: 'gte' })).toBe(true);
    expect(matchesRule(9, { value: 10, matchMode: 'gte' })).toBe(false);
    expect(matchesRule('abc', { value: 5, matchMode: 'gt' })).toBe(false);
    expect(matchesRule('item 10', { value: 'item 9', matchMode: 'gt' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5), { value: '2026-02-01', matchMode: 'lt' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5), { value: 'not a date', matchMode: 'gt' })).toBe(false);
    expect(matchesRule(45, { value: [40, 50], matchMode: 'between' })).toBe(true);
    expect(matchesRule(5, { value: [null, 10], matchMode: 'between' })).toBe(true);
    expect(matchesRule(15, { value: [10, null], matchMode: 'between' })).toBe(true);
    expect(matchesRule(null, { value: [1, 10], matchMode: 'between' })).toBe(false);
    expect(matchesRule(5, { value: 'x', matchMode: 'between' })).toBe(true);
  });

  it('matches days and rejects missing or broken dates', () => {
    expect(matchesRule(new Date(2026, 0, 5, 14), { value: new Date(2026, 0, 5), matchMode: 'dateIs' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5), { value: new Date(2026, 1, 1), matchMode: 'dateBefore' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5), { value: new Date(2026, 1, 1), matchMode: 'dateAfter' })).toBe(false);
    expect(matchesRule(new Date(2026, 0, 5), { value: new Date(2026, 0, 6), matchMode: 'dateIsNot' })).toBe(true);
    expect(matchesRule(null, { value: new Date(2026, 0, 6), matchMode: 'dateIs' })).toBe(false);
    expect(matchesRule('', { value: new Date(2026, 0, 6), matchMode: 'dateBefore' })).toBe(false);
    expect(matchesRule('broken', { value: new Date(2026, 0, 6), matchMode: 'dateAfter' })).toBe(false);
    expect(matchesRule(Date.UTC(2026, 0, 7), { value: new Date(2026, 0, 1), matchMode: 'dateAfter' })).toBe(true);
  });
});
