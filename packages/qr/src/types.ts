export type TxQrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export type TxQrDotStyle = 'square' | 'dots' | 'rounded' | 'soft';

export type TxQrEyeFrameStyle = 'square' | 'rounded' | 'circle';

export type TxQrEyeBallStyle = 'square' | 'rounded' | 'circle';

export type TxQrImageFormat = 'png' | 'svg';

export interface TxQrMatrix {
  version: number;
  size: number;
  errorCorrection: TxQrErrorCorrection;
  mask: number;
  modules: boolean[][];
}

export interface TxQrGradient {
  type?: 'linear' | 'radial';
  colors: readonly [string, string];
  rotation?: number;
}

export interface TxQrStyle {
  margin?: number;
  errorCorrection?: TxQrErrorCorrection;
  dotStyle?: TxQrDotStyle;
  eyeFrameStyle?: TxQrEyeFrameStyle;
  eyeBallStyle?: TxQrEyeBallStyle;
  logo?: string;
  logoSize?: number;
  logoMargin?: number;
}

export interface TxQrSvgOptions extends TxQrStyle {
  size?: number;
  color?: string;
  background?: string;
  eyeColor?: string;
  eyeBallColor?: string;
  gradient?: TxQrGradient;
  title?: string;
}

export interface TxQrPngOptions extends TxQrSvgOptions {
  pixelSize?: number;
}
