export type TxVirtualScrollerOrientation = 'vertical' | 'horizontal' | 'both';
export type TxVirtualScrollerPart = 'root' | 'spacer' | 'content' | 'item' | 'row' | 'loader' | 'loadingIcon';
export type TxVirtualScrollerPosition = number | readonly [number, number];

export interface TxVirtualScrollerRange {
  first: TxVirtualScrollerPosition;
  last: TxVirtualScrollerPosition;
}

export interface TxVirtualScrollerRenderedRange extends TxVirtualScrollerRange {
  viewport: TxVirtualScrollerRange;
}

export interface TxVirtualScrollerLazyLoadEvent {
  first: number;
  last: number;
}

export interface TxVirtualScrollerScrollEvent {
  originalEvent: Event;
}

export interface TxVirtualScrollerItemContext<T = unknown> {
  $implicit: T;
  index: number;
  count: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
}

export interface TxVirtualScrollerLoaderContext {
  $implicit: number;
  index: number;
  count: number;
}

export interface TxVirtualScrollerContentContext<T = unknown> {
  $implicit: T[];
  items: T[];
  first: number;
  last: number;
  count: number;
  spacerBefore: number;
  itemSize: number;
}
