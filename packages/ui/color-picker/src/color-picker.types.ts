/** Type of the picker value: `hex` string, `rgb` object or `hsb` object. */
export type TxColorFormat = 'hex' | 'rgb' | 'hsb';
/** Size of the picker: `small`, `medium` or `large`. */
export type TxColorPickerSize = 'small' | 'medium' | 'large';
/** Names of the parts of `tx-color-picker` that `pt` can style. */
export type TxColorPickerPart = 'root' | 'trigger' | 'swatch' | 'panel' | 'area' | 'hue' | 'input' | 'presets' | 'preset' | 'clear';

/** A colour as red, green and blue channels. */
export interface TxRgb {
  /** Red channel, 0 to 255. */
  r: number;
  /** Green channel, 0 to 255. */
  g: number;
  /** Blue channel, 0 to 255. */
  b: number;
}

/** A colour as hue, saturation and brightness. */
export interface TxHsb {
  /** Hue in degrees, 0 to 360. */
  h: number;
  /** Saturation in percent, 0 to 100. */
  s: number;
  /** Brightness in percent, 0 to 100. */
  b: number;
}

/** A colour value: a hex string, an `{ r, g, b }` object or an `{ h, s, b }` object. */
export type TxColorValue = string | TxRgb | TxHsb;
