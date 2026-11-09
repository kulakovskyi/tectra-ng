export type TxConfettiTone = 'accent' | 'neutral' | 'success';

export interface TxConfettiPiece {
  x: number;
  y: number;
  rotate: number;
  tone: TxConfettiTone;
}

export type TxConfettiPart = 'root' | 'piece';

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
