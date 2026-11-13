/** Colour of a confetti piece: `accent`, `neutral` or `success`. */
export type TxConfettiTone = 'accent' | 'neutral' | 'success';

/** One piece of a confetti burst. */
export interface TxConfettiPiece {
  /** Where the piece lands, horizontally from the middle, in px. */
  x: number;
  /** Where the piece lands, vertically from the middle, in px. */
  y: number;
  /** Turn of the piece when it lands, in degrees. */
  rotate: number;
  /** Colour of the piece. */
  tone: TxConfettiTone;
}

/** Names of the parts of `tx-confetti` that its `pt` input can style. */
export type TxConfettiPart = 'root' | 'piece';

/** The ten pieces `tx-confetti` bursts by default. */
export const TX_CONFETTI_PIECES: readonly TxConfettiPiece[] = [
  { x: -150, y: -90, rotate: 25, tone: 'accent' },
  { x: 140, y: -110, rotate: -35, tone: 'neutral' },
  { x: -120, y: 120, rotate: 60, tone: 'neutral' },
  { x: 160, y: 80, rotate: -15, tone: 'accent' },
  { x: -40, y: -160, rotate: 45, tone: 'success' },
  { x: 60, y: 160, rotate: -50, tone: 'success' },
  { x: -180, y: 10, rotate: 10, tone: 'accent' },
  { x: 190, y: -20, rotate: 80, tone: 'neutral' },
  { x: 90, y: -170, rotate: -70, tone: 'accent' },
  { x: -90, y: 175, rotate: 35, tone: 'success' },
];
