import { encodeQr } from './encoder';
import { TxQrPaths, qrPaths } from './paths';
import { TxQrGradient, TxQrMatrix, TxQrStyle } from './types';

const MAX_LOGO_SIZE = 0.4;

/** Place of the logo inside the code, in module units. */
export interface TxQrLogoBox {
  /** Left edge of the logo. */
  x: number;
  /** Top edge of the logo. */
  y: number;
  /** Side of the logo. */
  size: number;
  /** Side of the empty square cleared of dots around the logo. */
  clear: number;
}

/** Coordinates of the gradient across a code, ready for an SVG `linearGradient` or `radialGradient`. */
export interface TxQrGradientLine {
  /** `true` for a radial gradient. */
  radial: boolean;
  /** Start and end colour. */
  colors: readonly [string, string];
  /** Centre of a radial gradient on both axes. */
  center: number;
  /** Radius of a radial gradient. */
  radius: number;
  /** Start x of a linear gradient. */
  x1: number;
  /** Start y of a linear gradient. */
  y1: number;
  /** End x of a linear gradient. */
  x2: number;
  /** End y of a linear gradient. */
  y2: number;
}

/** Everything needed to draw a QR code: matrix, shape paths, logo box and view box. */
export interface TxQrLayout {
  /** The encoded matrix. */
  matrix: TxQrMatrix;
  /** Shape paths of the dots and eyes. */
  paths: TxQrPaths;
  /** Place of the logo; `null` without a logo. */
  logoBox: TxQrLogoBox | null;
  /** SVG view box including the quiet zone, also as a ready `value` string. */
  viewBox: { x: number; y: number; size: number; value: string };
}

/**
 * Position and size of the logo in module units, with the number of modules to clear around it; `null`
 * when the style has no logo.
 */
export function qrLogoBox(matrix: TxQrMatrix, style: TxQrStyle): TxQrLogoBox | null {
  if (!style.logo) {
    return null;
  }
  const side = Math.min(Math.max(style.logoSize ?? 0.22, 0), MAX_LOGO_SIZE) * matrix.size;
  const offset = (matrix.size - side) / 2;
  return { x: offset, y: offset, size: side, clear: Math.ceil(side + 2 * (style.logoMargin ?? 1)) };
}

/**
 * Coordinates of the gradient that runs across a code of the given size in modules, linear by the
 * rotation or radial from the centre.
 */
export function qrGradientLine(gradient: TxQrGradient, size: number): TxQrGradientLine {
  const center = size / 2;
  const angle = ((gradient.rotation ?? 0) * Math.PI) / 180;
  const dx = (Math.cos(angle) * size) / 2;
  const dy = (Math.sin(angle) * size) / 2;
  return { radial: gradient.type === 'radial', colors: gradient.colors, center, radius: size * 0.75, x1: center - dx, y1: center - dy, x2: center + dx, y2: center + dy };
}

/**
 * Encodes the text and returns the matrix, shape paths, logo box and view box in one call, for drawing
 * your own SVG.
 */
export function qrLayout(text: string, style: TxQrStyle = {}): TxQrLayout {
  const matrix = encodeQr(text, { errorCorrection: style.errorCorrection ?? (style.logo ? 'H' : 'M') });
  const logoBox = qrLogoBox(matrix, style);
  const margin = Math.max(style.margin ?? 1, 0);
  const total = matrix.size + 2 * margin;
  return {
    matrix,
    logoBox,
    paths: qrPaths(matrix, {
      dotStyle: style.dotStyle ?? 'square',
      eyeFrameStyle: style.eyeFrameStyle ?? 'square',
      eyeBallStyle: style.eyeBallStyle ?? 'square',
      clearSize: logoBox?.clear,
    }),
    viewBox: { x: -margin, y: -margin, size: total, value: `${-margin} ${-margin} ${total} ${total}` },
  };
}
