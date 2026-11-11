import { pickRandom, pickRandomN, shuffle } from './random';

describe('random', () => {
  const items = ['a', 'b', 'c', 'd'];

  it('picks one item', () => {
    expect(pickRandom(items, () => 0)).toBe('a');
    expect(pickRandom(items, () => 0.99)).toBe('d');
    expect(pickRandom([])).toBeNull();
    expect(pickRandom(null)).toBeNull();
  });

  it('picks several different items', () => {
    const picked = pickRandomN(items, 3);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    expect(pickRandomN(items, 10)).toHaveLength(4);
    expect(pickRandomN(items, 0)).toEqual([]);
    expect(pickRandomN(items, 2, () => 0)).toEqual(['a', 'b']);
  });

  it('shuffles without changing the input', () => {
    const result = shuffle(items);
    expect([...result].sort()).toEqual(items);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });
});
