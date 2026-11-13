/** Scroll direction: `vertical` list, `horizontal` list, or `both` for a grid. */
export type TxVirtualScrollerOrientation = 'vertical' | 'horizontal' | 'both';
/** Parts of `tx-virtual-scroller` that `pt` can style. */
export type TxVirtualScrollerPart = 'root' | 'spacer' | 'content' | 'item' | 'row' | 'loader' | 'loadingIcon';
/** An item index, or `[row, column]` for a `both` grid. */
export type TxVirtualScrollerPosition = number | readonly [number, number];

/** A span of items from `first` up to, not including, `last`. */
export interface TxVirtualScrollerRange {
  /** Index of the first item; `[row, column]` for a `both` grid. */
  first: TxVirtualScrollerPosition;
  /** Index after the last item; `[row, column]` for a `both` grid. */
  last: TxVirtualScrollerPosition;
}

/** The rendered items and, inside them, the ones that are visible. */
export interface TxVirtualScrollerRenderedRange extends TxVirtualScrollerRange {
  /** The items that are really visible, without the tolerance on both sides. */
  viewport: TxVirtualScrollerRange;
}

/** Event of `lazyLoad`: the range of items to load. */
export interface TxVirtualScrollerLazyLoadEvent {
  /** Index of the first item to load. */
  first: number;
  /** Index after the last item to load. */
  last: number;
}

/** Event of `scrolled`. */
export interface TxVirtualScrollerScrollEvent {
  /** The DOM scroll event. */
  originalEvent: Event;
}

/** Context of the `txVirtualScrollerItem` template. */
export interface TxVirtualScrollerItemContext<T = unknown> {
  /** The item; `undefined` while it is not loaded. */
  $implicit: T;
  /** Index of the item. */
  index: number;
  /** Number of items on this axis. */
  count: number;
  /** Whether this is the first item. */
  first: boolean;
  /** Whether this is the last item. */
  last: boolean;
  /** Whether the index is even. */
  even: boolean;
  /** Whether the index is odd. */
  odd: boolean;
}

/** Context of the `txVirtualScrollerLoader` template. */
export interface TxVirtualScrollerLoaderContext {
  /** Index of the item the loader stands for. */
  $implicit: number;
  /** Index of the item the loader stands for. */
  index: number;
  /** Number of items on this axis. */
  count: number;
}

/** Context of the `txVirtualScrollerContent` template that renders the whole range at once. */
export interface TxVirtualScrollerContentContext<T = unknown> {
  /** The items of the rendered range. */
  $implicit: T[];
  /** The items of the rendered range. */
  items: T[];
  /** Index of the first rendered item. */
  first: number;
  /** Index after the last rendered item. */
  last: number;
  /** Number of items on this axis. */
  count: number;
  /** Size in px of the empty space before the rendered items. */
  spacerBefore: number;
  /** Size in px of one item along the scroll axis. */
  itemSize: number;
}
