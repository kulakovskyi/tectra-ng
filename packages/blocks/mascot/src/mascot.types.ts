/** A short animation the mascot plays: `waving`, `looking`, `hopping`, `dancing` or `stretching`. */
export type TxMascotTrick = 'waving' | 'looking' | 'hopping' | 'dancing' | 'stretching';
/** State of `tx-mascot`: `idle`, `thinking`, `happy`, `sleeping`, `walking` or a trick. */
export type TxMascotState = 'idle' | 'thinking' | 'happy' | 'sleeping' | 'walking' | TxMascotTrick;
/** A part of the mascot body that is animated on its own. */
export type TxMascotBodyPart = 'antenna' | 'stem' | 'body' | 'eye' | 'mouth' | 'arm-left' | 'arm-right' | 'leg-left' | 'leg-right';
/** Names of the parts of `tx-mascot` that its `pt` input can style. */
export type TxMascotPart = 'root' | 'svg';

/** A pixel of the sprite in grid units. */
export interface TxMascotPixel {
  /** Column, from the left. */
  x: number;
  /** Row, from the top. */
  y: number;
}

/** All pixels of one body part. */
export interface TxMascotLayer {
  /** The body part. */
  part: TxMascotBodyPart;
  /** Pixels the part is drawn with. */
  pixels: TxMascotPixel[];
}
