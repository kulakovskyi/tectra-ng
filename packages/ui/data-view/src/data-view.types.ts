/** How the items are laid out: as a `list` or a `grid`. */
export type TxDataViewLayout = 'list' | 'grid';
/** Where the paginator sits: `top`, `bottom` or `both`. */
export type TxDataViewPaginatorPosition = 'top' | 'bottom' | 'both';
/** Sort direction: `asc`, `desc`, or `null` for the original order. */
export type TxDataViewSortOrder = 'asc' | 'desc' | null;
/** Names of the parts of `tx-data-view` that `pt` can style. */
export type TxDataViewPart = 'root' | 'header' | 'content' | 'empty' | 'loading' | 'footer' | 'paginator';

/** Payload of `lazyLoad`: the page, sort and search the server should answer. */
export interface TxDataViewLazyLoadEvent {
  /** Index of the first item of the wanted page. */
  first: number;
  /** Number of items per page. */
  rows: number;
  /** Field to sort by, or `null`. */
  sortField: string | null;
  /** Sort direction. */
  sortOrder: TxDataViewSortOrder;
  /** Search text; empty for none. */
  filter: string;
}

/** Payload of `sortChange`: the field and the direction. */
export interface TxDataViewSortEvent {
  /** Field to sort by, or `null`. */
  sortField: string | null;
  /** Sort direction. */
  sortOrder: TxDataViewSortOrder;
}

/** Context of the list and grid templates: the items of the current page. */
export interface TxDataViewItemsContext<T = unknown> {
  /** Items of the current page, so `let-items` works. */
  $implicit: T[];
  /** Items of the current page. */
  items: T[];
  /** Index in the whole collection of the first item of the page. */
  first: number;
}
