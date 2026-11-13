/** How the browser loads the image: `lazy` when it nears the viewport, `eager` at once. */
export type TxImageLoading = 'lazy' | 'eager';

/** Parts of `tx-image` that `pt` can style. */
export type TxImagePart = 'root' | 'image' | 'previewButton' | 'previewIcon' | 'mask' | 'toolbar' | 'action' | 'original';

/** Context of a `txImagePreview` template: the image in the preview layer. */
export interface TxImagePreviewContext {
  /** Address of the preview image. */
  $implicit: string;
  /** Address of the preview image. */
  src: string;
  /** Alternative text of the image. */
  alt: string;
  /** Inline styles with the current zoom, rotation and offset; apply them to the image. */
  style: Record<string, string>;
  /** Closes the preview. */
  close: () => void;
}

/** Context of a `txImageIndicator` template: the content of the preview button. */
export interface TxImageIndicatorContext {
  /** Address of the preview image. */
  $implicit: string;
}
