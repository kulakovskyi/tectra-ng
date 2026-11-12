import { nextListIndex } from './list-navigation';
import { TxTypeahead } from './typeahead';

describe('nextListIndex', () => {
  const base = { count: 5, current: 2 };

  it('moves with arrows and loops', () => {
    expect(nextListIndex('ArrowDown', base)).toBe(3);
    expect(nextListIndex('ArrowUp', base)).toBe(1);
    expect(nextListIndex('ArrowDown', { ...base, current: 4 })).toBe(0);
    expect(nextListIndex('ArrowDown', { ...base, current: 4, loop: false })).toBe(4);
  });

  it('jumps to edges and pages', () => {
    expect(nextListIndex('Home', base)).toBe(0);
    expect(nextListIndex('End', base)).toBe(4);
    expect(nextListIndex('PageDown', { ...base, pageSize: 2 })).toBe(4);
    expect(nextListIndex('PageUp', { ...base, pageSize: 10 })).toBe(0);
  });

  it('skips disabled items and ignores other keys', () => {
    expect(nextListIndex('ArrowDown', { ...base, isDisabled: (index) => index === 3 })).toBe(4);
    expect(nextListIndex('Home', { ...base, isDisabled: (index) => index === 0 })).toBe(1);
    expect(nextListIndex('a', base)).toBeNull();
    expect(nextListIndex('ArrowDown', { count: 0, current: -1 })).toBeNull();
  });

  it('stays in place when every other item is disabled', () => {
    expect(nextListIndex('ArrowDown', { ...base, isDisabled: (index) => index !== 2 })).toBe(2);
    expect(nextListIndex('ArrowUp', { ...base, isDisabled: () => true })).toBe(2);
  });

  it('starts from an edge when nothing is active', () => {
    expect(nextListIndex('ArrowDown', { count: 3, current: -1 })).toBe(0);
    expect(nextListIndex('ArrowUp', { count: 3, current: -1 })).toBe(2);
  });
});

describe('TxTypeahead', () => {
  const labels = ['Kyiv', 'Kharkiv', 'Lviv', 'Odesa'];

  it('finds by prefix and cycles through repeated letters', () => {
    const typeahead = new TxTypeahead();
    expect(typeahead.search('k', labels, -1)).toBe(0);
    expect(typeahead.search('k', labels, 0)).toBe(1);
    typeahead.reset();
    expect(typeahead.search('o', labels, 0)).toBe(3);
  });

  it('matches a typed word', () => {
    const typeahead = new TxTypeahead();
    typeahead.search('k', labels, -1);
    expect(typeahead.search('h', labels, 0)).toBe(1);
    expect(typeahead.search('xx', labels, 0)).toBeNull();
  });

  it('finds nothing for an unknown letter or an empty list', () => {
    const typeahead = new TxTypeahead();
    expect(typeahead.search('z', labels, 0)).toBeNull();
    expect(typeahead.search('k', [], 0)).toBeNull();
  });

  it('forgets the typed word after the delay', () => {
    vi.useFakeTimers();
    try {
      const typeahead = new TxTypeahead(300);
      expect(typeahead.search('l', labels, -1)).toBe(2);
      vi.advanceTimersByTime(300);
      expect(typeahead.search('o', labels, 2)).toBe(3);
    } finally {
      vi.useRealTimers();
    }
  });
});
