export type TxCarouselOrientation = 'horizontal' | 'vertical';

export type TxCarouselPart = 'root' | 'header' | 'content' | 'viewport' | 'track' | 'item' | 'navigator' | 'indicators' | 'indicator' | 'footer';

export interface TxCarouselResponsiveOption {
  breakpoint: string;
  numVisible: number;
  numScroll?: number;
}

export interface TxCarouselItemContext<T = unknown> {
  $implicit: T;
  index: number;
  active: boolean;
}

export interface TxCarouselIndicatorContext {
  $implicit: number;
  active: boolean;
}
