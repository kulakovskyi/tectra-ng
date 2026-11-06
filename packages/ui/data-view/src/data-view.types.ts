export type TxDataViewLayout = 'list' | 'grid';
export type TxDataViewPaginatorPosition = 'top' | 'bottom' | 'both';
export type TxDataViewSortOrder = 'asc' | 'desc' | null;
export type TxDataViewPart = 'root' | 'header' | 'content' | 'empty' | 'loading' | 'footer' | 'paginator';

export interface TxDataViewLazyLoadEvent {
  first: number;
  rows: number;
  sortField: string | null;
  sortOrder: TxDataViewSortOrder;
  filter: string;
}

export interface TxDataViewSortEvent {
  sortField: string | null;
  sortOrder: TxDataViewSortOrder;
}

export interface TxDataViewItemsContext<T = unknown> {
  $implicit: T[];
  items: T[];
  first: number;
}
