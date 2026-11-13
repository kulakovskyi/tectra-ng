/** Number of pages needed for the given record count and page size; `0` when there are no records. */
export function pageCountOf(totalRecords: number, rows: number): number {
  if (totalRecords <= 0) return 0;
  return rows > 0 ? Math.ceil(totalRecords / rows) : 1;
}

/** Converts the index of the first row into a zero-based page number. */
export function firstToPage(first: number, rows: number): number {
  return rows > 0 ? Math.floor(Math.max(0, first) / rows) : 0;
}

/** Converts a zero-based page number into the index of the first row of that page. */
export function pageToFirst(page: number, rows: number): number {
  return Math.max(0, page) * Math.max(0, rows);
}

/** Zero-based page numbers to show as links, keeping the current page centred within `linkSize` links. */
export function pageLinksOf(page: number, pageCount: number, linkSize: number): number[] {
  const visible = Math.max(0, Math.min(linkSize, pageCount));
  let start = Math.max(0, Math.ceil(page - visible / 2));
  const end = Math.min(pageCount - 1, start + visible - 1);
  start = Math.max(0, start - (visible - (end - start + 1)));
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}
