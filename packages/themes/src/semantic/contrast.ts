import { TectraColorScale } from '@tectra-ng/tokens';

function channel(hex: string, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a `#rrggbb` color, from 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

/** Contrast ratio of a `#rrggbb` color against white. */
export function contrastWithWhite(hex: string): number {
  return 1.05 / (relativeLuminance(hex) + 0.05);
}

/**
 * Scale step that is the base of the primary color: `600` when white text on it reaches the 4.5:1 contrast,
 * else `700`.
 */
export function primaryBaseStep(scale: TectraColorScale): 600 | 700 {
  return contrastWithWhite(scale[600]) >= 4.5 ? 600 : 700;
}
