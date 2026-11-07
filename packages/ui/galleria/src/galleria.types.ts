export type TxGalleriaPosition = 'top' | 'bottom' | 'left' | 'right';

export type TxGalleriaPart =
  | 'root'
  | 'mask'
  | 'closeButton'
  | 'header'
  | 'content'
  | 'items'
  | 'item'
  | 'navigator'
  | 'caption'
  | 'indicators'
  | 'indicator'
  | 'thumbnails'
  | 'thumbnailNavigator'
  | 'thumbnail'
  | 'footer';

export interface TxGalleriaImage {
  src: string;
  thumbnailSrc?: string;
  alt?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

export interface TxGalleriaResponsiveOption {
  breakpoint: string;
  numVisible: number;
}

export interface TxGalleriaItemContext<T = unknown> {
  $implicit: T;
  index: number;
}

export interface TxGalleriaThumbnailContext<T = unknown> {
  $implicit: T;
  index: number;
  active: boolean;
}

export interface TxGalleriaIndicatorContext {
  $implicit: number;
  active: boolean;
}
