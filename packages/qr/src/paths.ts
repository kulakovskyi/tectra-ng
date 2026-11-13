import { TxQrDotStyle, TxQrEyeBallStyle, TxQrEyeFrameStyle, TxQrMatrix } from './types';

/** Shapes for `qrPaths`: dots, eye rings, eye centres and an empty area in the middle. */
export interface TxQrShapeOptions {
  /** Shape of the data dots. */
  dotStyle: TxQrDotStyle;
  /** Shape of the eye rings. */
  eyeFrameStyle: TxQrEyeFrameStyle;
  /** Shape of the eye centres. */
  eyeBallStyle: TxQrEyeBallStyle;
  /** Side in modules of the empty square in the middle that is left free for a logo (default 0). */
  clearSize?: number;
}

/** SVG path data of a QR code in module units. */
export interface TxQrPaths {
  /** Path of the data dots. */
  dots: string;
  /** Path of the three eye rings; fill it with the `evenodd` rule. */
  eyeFrames: string;
  /** Path of the three eye centres. */
  eyeBalls: string;
  /** Top-left corner of each of the three eyes in modules. */
  eyes: readonly { x: number; y: number }[];
}

const EYE = 7;
const DOT_RADIUS = 0.48;
const SOFT_INSET = 0.05;
const SOFT_RADIUS = 0.25;

const round = (value: number) => +value.toFixed(3);

function rect(x: number, y: number, width: number, height: number): string {
  return `M${round(x)} ${round(y)}h${round(width)}v${round(height)}h${round(-width)}z`;
}

/** SVG path data of a rectangle with rounded corners; the radius is cut to half of the shorter side. */
export function roundedRect(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height / 2);
  if (r <= 0) {
    return rect(x, y, width, height);
  }
  const w = round(width - 2 * r);
  const h = round(height - 2 * r);
  const a = round(r);
  return `M${round(x + r)} ${round(y)}h${w}a${a} ${a} 0 0 1 ${a} ${a}v${h}a${a} ${a} 0 0 1 ${-a} ${a}h${-w}a${a} ${a} 0 0 1 ${-a} ${-a}v${-h}a${a} ${a} 0 0 1 ${a} ${-a}z`;
}

function circle(cx: number, cy: number, radius: number): string {
  const r = round(radius);
  return `M${round(cx - radius)} ${round(cy)}a${r} ${r} 0 1 0 ${round(2 * radius)} 0a${r} ${r} 0 1 0 ${round(-2 * radius)} 0z`;
}

function corneredSquare(x: number, y: number, corners: readonly [boolean, boolean, boolean, boolean]): string {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners.map((rounded) => (rounded ? 0.5 : 0));
  const parts = [`M${x + topLeft} ${y}`, `h${round(1 - topLeft - topRight)}`];
  if (topRight) {
    parts.push(`a${topRight} ${topRight} 0 0 1 ${topRight} ${topRight}`);
  }
  parts.push(`v${round(1 - topRight - bottomRight)}`);
  if (bottomRight) {
    parts.push(`a${bottomRight} ${bottomRight} 0 0 1 ${-bottomRight} ${bottomRight}`);
  }
  parts.push(`h${round(-(1 - bottomRight - bottomLeft))}`);
  if (bottomLeft) {
    parts.push(`a${bottomLeft} ${bottomLeft} 0 0 1 ${-bottomLeft} ${-bottomLeft}`);
  }
  parts.push(`v${round(-(1 - bottomLeft - topLeft))}`);
  if (topLeft) {
    parts.push(`a${topLeft} ${topLeft} 0 0 1 ${topLeft} ${-topLeft}`);
  }
  return parts.join('') + 'z';
}

function eyeFrame(x: number, y: number, style: TxQrEyeFrameStyle): string {
  switch (style) {
    case 'circle':
      return circle(x + 3.5, y + 3.5, 3.5) + circle(x + 3.5, y + 3.5, 2.5);
    case 'rounded':
      return roundedRect(x, y, EYE, EYE, 2.25) + roundedRect(x + 1, y + 1, 5, 5, 1.25);
    default:
      return rect(x, y, EYE, EYE) + rect(x + 1, y + 1, 5, 5);
  }
}

function eyeBall(x: number, y: number, style: TxQrEyeBallStyle): string {
  switch (style) {
    case 'circle':
      return circle(x + 3.5, y + 3.5, 1.5);
    case 'rounded':
      return roundedRect(x + 2, y + 2, 3, 3, 0.9);
    default:
      return rect(x + 2, y + 2, 3, 3);
  }
}

/**
 * Builds SVG path data (in module units) for the dots, eye rings and eye centres of a matrix in the
 * chosen shapes.
 */
export function qrPaths(matrix: TxQrMatrix, options: TxQrShapeOptions): TxQrPaths {
  const size = matrix.size;
  const eyes = [
    { x: 0, y: 0 },
    { x: size - EYE, y: 0 },
    { x: 0, y: size - EYE },
  ];
  const clear = options.clearSize ?? 0;
  const inEye = (x: number, y: number) => eyes.some((eye) => x >= eye.x && x < eye.x + EYE && y >= eye.y && y < eye.y + EYE);
  const cleared = (x: number, y: number) => clear > 0 && Math.abs(x + 0.5 - size / 2) < clear / 2 && Math.abs(y + 0.5 - size / 2) < clear / 2;
  const dark = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size && matrix.modules[y][x] && !inEye(x, y) && !cleared(x, y);

  const parts: string[] = [];
  for (let y = 0; y < size; y += 1) {
    if (options.dotStyle === 'square') {
      for (let x = 0; x < size; x += 1) {
        if (!dark(x, y)) {
          continue;
        }
        let end = x;
        while (dark(end + 1, y)) {
          end += 1;
        }
        parts.push(rect(x, y, end - x + 1, 1));
        x = end;
      }
      continue;
    }
    for (let x = 0; x < size; x += 1) {
      if (!dark(x, y)) {
        continue;
      }
      if (options.dotStyle === 'dots') {
        parts.push(circle(x + 0.5, y + 0.5, DOT_RADIUS));
      } else if (options.dotStyle === 'soft') {
        parts.push(roundedRect(x + SOFT_INSET, y + SOFT_INSET, 1 - 2 * SOFT_INSET, 1 - 2 * SOFT_INSET, SOFT_RADIUS));
      } else {
        const top = dark(x, y - 1);
        const right = dark(x + 1, y);
        const bottom = dark(x, y + 1);
        const left = dark(x - 1, y);
        parts.push(corneredSquare(x, y, [!top && !left, !top && !right, !bottom && !right, !bottom && !left]));
      }
    }
  }

  return {
    dots: parts.join(''),
    eyeFrames: eyes.map((eye) => eyeFrame(eye.x, eye.y, options.eyeFrameStyle)).join(''),
    eyeBalls: eyes.map((eye) => eyeBall(eye.x, eye.y, options.eyeBallStyle)).join(''),
    eyes,
  };
}
