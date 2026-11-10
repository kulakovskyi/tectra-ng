export type TxMascotTrick = 'waving' | 'looking' | 'hopping' | 'dancing' | 'stretching';
export type TxMascotState = 'idle' | 'thinking' | 'happy' | 'sleeping' | 'walking' | TxMascotTrick;
export type TxMascotBodyPart = 'antenna' | 'stem' | 'body' | 'eye' | 'mouth' | 'arm-left' | 'arm-right' | 'leg-left' | 'leg-right';
export type TxMascotPart = 'root' | 'svg';

export interface TxMascotPixel {
  x: number;
  y: number;
}

export interface TxMascotLayer {
  part: TxMascotBodyPart;
  pixels: TxMascotPixel[];
}
