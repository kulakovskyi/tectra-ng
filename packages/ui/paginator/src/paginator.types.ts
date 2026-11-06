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

export interface TxPageState {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

export interface TxRowsPerPageShowAll {
  showAll: string;
}

export type TxRowsPerPageOption = number | TxRowsPerPageShowAll;

export interface TxRowsPerPageItem {
  label: string;
  value: number;
}

export interface TxPaginatorTemplateContext {
  $implicit: TxPageState;
}

export interface TxPaginationParams {
  page: number;
  limit?: number;
  qtt?: number;
  total?: number;
  count?: number;
}
