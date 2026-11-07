export type TxImageLoading = 'lazy' | 'eager';

export type TxImagePart = 'root' | 'image' | 'previewButton' | 'previewIcon' | 'mask' | 'toolbar' | 'action' | 'original';

export interface TxImagePreviewContext {
  $implicit: string;
  src: string;
  alt: string;
  style: Record<string, string>;
  close: () => void;
}

export interface TxImageIndicatorContext {
  $implicit: string;
}
