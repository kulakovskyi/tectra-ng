import { encodeQr } from './encoder';
import { TxQrPaths, qrPaths } from './paths';
import { TxQrGradient, TxQrMatrix, TxQrStyle } from './types';

const MAX_LOGO_SIZE = 0.4;

export interface TxQrLogoBox {
  x: number;
  y: number;
  size: number;
  clear: number;
}

export interface TxQrGradientLine {
  radial: boolean;
  colors: readonly [string, string];
  center: number;
  radius: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TxQrLayout {
  matrix: TxQrMatrix;
  paths: TxQrPaths;
  logoBox: TxQrLogoBox | null;
  viewBox: { x: number; y: number; size: number; value: string };
}

export function qrLogoBox(matrix: TxQrMatrix, style: TxQrStyle): TxQrLogoBox | null {
  if (!style.logo) {
    return null;
  }
  const side = Math.min(Math.max(style.logoSize ?? 0.22, 0), MAX_LOGO_SIZE) * matrix.size;
  const offset = (matrix.size - side) / 2;
  return { x: offset, y: offset, size: side, clear: Math.ceil(side + 2 * (style.logoMargin ?? 1)) };
}

export function qrGradientLine(gradient: TxQrGradient, size: number): TxQrGradientLine {
  const center = size / 2;
  const angle = ((gradient.rotation ?? 0) * Math.PI) / 180;
  const dx = (Math.cos(angle) * size) / 2;
  const dy = (Math.sin(angle) * size) / 2;
  return { radial: gradient.type === 'radial', colors: gradient.colors, center, radius: size * 0.75, x1: center - dx, y1: center - dy, x2: center + dx, y2: center + dy };
}

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
