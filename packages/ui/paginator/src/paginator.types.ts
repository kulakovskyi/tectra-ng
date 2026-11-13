/** Parts of `tx-paginator` that `pt` can style. */
export type TxPaginatorPart =
  | 'root'
  | 'total'
  | 'bar'
  | 'start'
  | 'end'
  | 'currentPageReport'
  | 'first'
  | 'previous'
  | 'pages'
  | 'page'
  | 'next'
  | 'last'
  | 'jumpToPageDropdown'
  | 'jumpToPageInput'
  | 'rowsPerPageDropdown';

/**
 * Current position of a paginator: zero-based page, index of the first row, page size and number of
 * pages.
 */
export interface TxPageState {
  /** Zero-based index of the current page. */
  page: number;
  /** Zero-based index of the first row on the current page. */
  first: number;
  /** Number of rows per page. */
  rows: number;
  /** Total number of pages. */
  pageCount: number;
}

/** Rows-per-page entry that shows all rows at once, under a custom label. */
export interface TxRowsPerPageShowAll {
  /** Label of the "show all" entry in the rows-per-page dropdown. */
  showAll: string;
}

/** One entry of the rows-per-page dropdown: a page size or a "show all" entry. */
export type TxRowsPerPageOption = number | TxRowsPerPageShowAll;

/** A rows-per-page entry as shown in the dropdown: its label and page size. */
export interface TxRowsPerPageItem {
  /** Text of the entry in the rows-per-page dropdown. */
  label: string;
  /** Page size the entry sets. */
  value: number;
}

/** Context of the paginator templates (`txPaginatorStart`, `txPaginatorEnd`, ...). */
export interface TxPaginatorTemplateContext {
  /** Current paginator state. */
  $implicit: TxPageState;
}

/** Page parameters of a paginated request or response: one-based page, page size and totals. */
export interface TxPaginationParams {
  /** One-based page number. */
  page: number;
  /** Page size. */
  limit?: number;
  /** Extra field some backends send next to `limit`; the kit does not read it. */
  qtt?: number;
  /** Total number of records. */
  total?: number;
  /** Extra field some backends send next to `total`; the kit does not read it. */
  count?: number;
}
