/**
 * Error-correction level of a QR code: `L`, `M`, `Q` or `H`, from the least to the most damage it
 * survives.
 */
export type TxQrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

/** Shape of the data dots: `square`, `dots`, `rounded` (neighbours join) or `soft`. */
export type TxQrDotStyle = 'square' | 'dots' | 'rounded' | 'soft';

/** Shape of the outer ring of a corner eye: `square`, `rounded` or `circle`. */
export type TxQrEyeFrameStyle = 'square' | 'rounded' | 'circle';

/** Shape of the centre of a corner eye: `square`, `rounded` or `circle`. */
export type TxQrEyeBallStyle = 'square' | 'rounded' | 'circle';

/** Format a QR code can be exported in: `png` or `svg`. */
export type TxQrImageFormat = 'png' | 'svg';

/** An encoded QR code: its version, size, error-correction level, mask and the grid of modules. */
export interface TxQrMatrix {
  /** QR version from 1 to 40; a higher version holds more data. */
  version: number;
  /** Side of the grid in modules, without the quiet zone. */
  size: number;
  /** Error-correction level the code was encoded with. */
  errorCorrection: TxQrErrorCorrection;
  /** Mask pattern from 0 to 7 applied to the code. */
  mask: number;
  /** Rows of the grid; `true` is a dark module. */
  modules: boolean[][];
}

/** Gradient over the dots of a QR code. */
export interface TxQrGradient {
  /** `linear` (default) or `radial`. */
  type?: 'linear' | 'radial';
  /** Start and end colour of the gradient. */
  colors: readonly [string, string];
  /** Angle of a linear gradient in degrees (default 0, left to right). */
  rotation?: number;
}

/** Look of a QR code: quiet zone, error correction, shapes and an optional logo. */
export interface TxQrStyle {
  /** Quiet zone around the code in modules (default 1). */
  margin?: number;
  /** Error-correction level; `M` by default, `H` when there is a logo. */
  errorCorrection?: TxQrErrorCorrection;
  /** Shape of the data dots (default `square`). */
  dotStyle?: TxQrDotStyle;
  /** Shape of the outer ring of the corner eyes (default `square`). */
  eyeFrameStyle?: TxQrEyeFrameStyle;
  /** Shape of the centre of the corner eyes (default `square`). */
  eyeBallStyle?: TxQrEyeBallStyle;
  /** URL of an image shown in the middle of the code. */
  logo?: string;
  /** Side of the logo as a share of the code (default 0.22, at most 0.4). */
  logoSize?: number;
  /** Empty modules left around the logo (default 1). */
  logoMargin?: number;
}

/** Options of `qrToSvg`: the code style plus size, colours, gradient and title. */
export interface TxQrSvgOptions extends TxQrStyle {
  /** Width and height of the SVG in px (default 200). */
  size?: number;
  /** Colour of the dots (default `#000000`). */
  color?: string;
  /** Background colour (default `#ffffff`). */
  background?: string;
  /** Colour of the eye rings; the dot colour or gradient when not set. */
  eyeColor?: string;
  /** Colour of the eye centres; falls back to `eyeColor`, then to the dot colour. */
  eyeBallColor?: string;
  /** Gradient over the dots; replaces `color`. */
  gradient?: TxQrGradient;
  /** Text of the SVG `<title>`, read by screen readers. */
  title?: string;
}

/** Options of `qrToPng`: the SVG options plus the PNG size. */
export interface TxQrPngOptions extends TxQrSvgOptions {
  /** Side of the PNG in px (default 1024). */
  pixelSize?: number;
}
