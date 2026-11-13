import { TxHsb, TxRgb } from './color-picker.types';

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Reads a `#rgb` or `#rrggbb` hex text (the `#` is optional) into RGB channels; `null` when it is not a hex colour.
 */
export function parseHex(text: string): TxRgb | null {
  const match = HEX.exec(text.trim());
  if (!match) {
    return null;
  }
  const digits = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1];
  return { r: parseInt(digits.slice(0, 2), 16), g: parseInt(digits.slice(2, 4), 16), b: parseInt(digits.slice(4, 6), 16) };
}

/** Writes RGB channels as a lowercase `#rrggbb` string; channels are rounded and kept within 0 to 255. */
export function rgbToHex({ r, g, b }: TxRgb): string {
  return `#${[r, g, b].map((channel) => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Converts RGB channels (0 to 255) to hue (0 to 360), saturation and brightness (0 to 100), rounded to whole numbers.
 */
export function rgbToHsb({ r, g, b }: TxRgb): TxHsb {
  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);
  let hue = 0;
  if (delta) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
  }
  return { h: Math.round((hue * 60 + 360) % 360), s: Math.round(max ? (delta / max) * 100 : 0), b: Math.round(max * 100) };
}

/** Converts hue (0 to 360), saturation and brightness (0 to 100) to RGB channels (0 to 255). */
export function hsbToRgb({ h, s, b }: TxHsb): TxRgb {
  const saturation = clamp(s, 0, 100) / 100;
  const brightness = clamp(b, 0, 100) / 100;
  const channel = (offset: number) => {
    const k = (offset + clamp(h, 0, 360) / 60) % 6;
    return Math.round((brightness - brightness * saturation * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return { r: channel(5), g: channel(3), b: channel(1) };
}

/** Turns a hex string, an RGB object or an HSB object into HSB; `null` when the value is none of them. */
export function toHsb(value: unknown): TxHsb | null {
  if (typeof value === 'string') {
    const rgb = parseHex(value);
    return rgb ? rgbToHsb(rgb) : null;
  }
  if (value && typeof value === 'object') {
    const color = value as Partial<TxRgb & TxHsb>;
    if (typeof color.r === 'number' && typeof color.g === 'number' && typeof color.b === 'number') {
      return rgbToHsb({ r: color.r, g: color.g, b: color.b });
    }
    if (typeof color.h === 'number' && typeof color.s === 'number' && typeof color.b === 'number') {
      return { h: color.h, s: color.s, b: color.b };
    }
  }
  return null;
}
