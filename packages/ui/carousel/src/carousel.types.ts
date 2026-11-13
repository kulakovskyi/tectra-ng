/** Direction the items move: `horizontal` or `vertical`. */
export type TxCarouselOrientation = 'horizontal' | 'vertical';

/** Names of the parts of `tx-carousel` that `pt` can style. */
export type TxCarouselPart = 'root' | 'header' | 'content' | 'viewport' | 'track' | 'item' | 'navigator' | 'indicators' | 'indicator' | 'footer';

/** How many items show and scroll while the window is at most `breakpoint` wide. */
export interface TxCarouselResponsiveOption {
  /** Largest window width this option applies to, as a CSS length such as `768px`. */
  breakpoint: string;
  /** Number of items shown at once. */
  numVisible: number;
  /** Number of items one step moves; the `numScroll` of the carousel when not set. */
  numScroll?: number;
}

/** Context of the `txCarouselItem` template. */
export interface TxCarouselItemContext<T = unknown> {
  /** The item, so `let-item` works. */
  $implicit: T;
  /** Position of the item in `value`. */
  index: number;
  /** Whether the item is on the visible page. */
  active: boolean;
}

/** Context of the `txCarouselIndicator` template. */
export interface TxCarouselIndicatorContext {
  /** Index of the page the indicator stands for. */
  $implicit: number;
  /** Whether this is the current page. */
  active: boolean;
}
