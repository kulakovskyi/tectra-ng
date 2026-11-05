export type TxColorFormat = 'hex' | 'rgb' | 'hsb';
export type TxColorPickerSize = 'small' | 'medium' | 'large';
export type TxColorPickerPart = 'root' | 'trigger' | 'swatch' | 'panel' | 'area' | 'hue' | 'input' | 'presets' | 'preset' | 'clear';

export interface TxRgb {
  r: number;
  g: number;
  b: number;
}

export interface TxHsb {
  h: number;
  s: number;
  b: number;
}

export type TxColorValue = string | TxRgb | TxHsb;
