import { firstToPage, pageCountOf, pageLinksOf, pageToFirst } from './pagination';

describe('@tectra-ng/utils/pagination', () => {
  it('converts a server page into the paginator position and back', () => {
    const rows = 20;
    const first = pageToFirst(3 - 1, rows);
    expect(first).toBe(40);
    expect(firstToPage(first, rows) + 1).toBe(3);
    expect(pageCountOf(87, rows)).toBe(5);
    expect(pageLinksOf(2, 5, 3)).toEqual([1, 2, 3]);
  });
});
