/** Side of the main image where thumbnails, indicators or navigators are placed. */
export type TxGalleriaPosition = 'top' | 'bottom' | 'left' | 'right';

/** Parts of `tx-galleria` that `pt` can style. */
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

/** An image of `tx-galleria` with an optional thumbnail, text and size. */
export interface TxGalleriaImage {
  /** Address of the full image. */
  src: string;
  /** Address of the thumbnail; `src` when empty. */
  thumbnailSrc?: string;
  /** Alternative text of the image. */
  alt?: string;
  /** Caption title. */
  title?: string;
  /** Caption text under the title. */
  description?: string;
  /** Width attribute of the image, in px; avoids layout shift. */
  width?: number;
  /** Height attribute of the image, in px; avoids layout shift. */
  height?: number;
}

/** Changes `numVisible` of `tx-galleria` at a window width. */
export interface TxGalleriaResponsiveOption {
  /** Maximum window width the option applies to, as a CSS length such as `768px`. */
  breakpoint: string;
  /** Number of thumbnails shown at once at this width. */
  numVisible: number;
}

/** Context of a `txGalleriaItem` template: the main slide. */
export interface TxGalleriaItemContext<T = unknown> {
  /** The item of `value` the slide shows. */
  $implicit: T;
  /** Position of the item in `value`. */
  index: number;
}

/** Context of a `txGalleriaThumbnail` template: one thumbnail. */
export interface TxGalleriaThumbnailContext<T = unknown> {
  /** The item of `value` the thumbnail shows. */
  $implicit: T;
  /** Position of the item in `value`. */
  index: number;
  /** `true` for the thumbnail of the current slide. */
  active: boolean;
}

/** Context of a `txGalleriaIndicator` template: one indicator dot. */
export interface TxGalleriaIndicatorContext {
  /** Position of the slide the indicator belongs to. */
  $implicit: number;
  /** `true` for the indicator of the current slide. */
  active: boolean;
}
