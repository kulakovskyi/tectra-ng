import { firstToPage, pageCountOf, pageLinksOf, pageToFirst } from './pagination';

describe('pagination', () => {
  it('counts pages', () => {
    expect(pageCountOf(0, 10)).toBe(0);
    expect(pageCountOf(-3, 10)).toBe(0);
    expect(pageCountOf(101, 10)).toBe(11);
    expect(pageCountOf(5, 0)).toBe(1);
  });

  it('converts between pages and first rows', () => {
    expect(firstToPage(25, 10)).toBe(2);
    expect(firstToPage(-5, 10)).toBe(0);
    expect(firstToPage(25, 0)).toBe(0);
    expect(pageToFirst(3, 20)).toBe(60);
    expect(pageToFirst(-1, 20)).toBe(0);
    expect(pageToFirst(2, -5)).toBe(0);
  });

  it('keeps a window of page links around the current page', () => {
    expect(pageLinksOf(0, 12, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(pageLinksOf(6, 12, 5)).toEqual([4, 5, 6, 7, 8]);
    expect(pageLinksOf(11, 12, 5)).toEqual([7, 8, 9, 10, 11]);
    expect(pageLinksOf(1, 3, 5)).toEqual([0, 1, 2]);
    expect(pageLinksOf(0, 0, 5)).toEqual([]);
  });
});
