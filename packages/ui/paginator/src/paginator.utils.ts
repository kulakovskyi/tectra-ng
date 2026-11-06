export function pageCountOf(totalRecords: number, rows: number): number {
  if (totalRecords <= 0) return 0;
  return rows > 0 ? Math.ceil(totalRecords / rows) : 1;
}

export function firstToPage(first: number, rows: number): number {
  return rows > 0 ? Math.floor(Math.max(0, first) / rows) : 0;
}

export function pageToFirst(page: number, rows: number): number {
  return Math.max(0, page) * Math.max(0, rows);
}

export function pageLinksOf(page: number, pageCount: number, linkSize: number): number[] {
  const visible = Math.max(0, Math.min(linkSize, pageCount));
  let start = Math.max(0, Math.ceil(page - visible / 2));
  const end = Math.min(pageCount - 1, start + visible - 1);
  start = Math.max(0, start - (visible - (end - start + 1)));
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}
