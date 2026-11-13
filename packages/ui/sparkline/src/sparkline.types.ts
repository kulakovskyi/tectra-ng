/** Colour of the sparkline line and area: `primary`, `info`, `success`, `warn` or `danger`. */
export type TxSparklineTone = 'primary' | 'info' | 'success' | 'warn' | 'danger';
/** Parts of `tx-sparkline` that `pt` can style. */
export type TxSparklinePart = 'root' | 'svg' | 'area' | 'line';

/** A point of the sparkline in its 120 × 36 drawing box. */
export interface TxSparklinePoint {
  /** Horizontal position in the drawing box. */
  x: number;
  /** Vertical position in the drawing box; smaller values are higher. */
  y: number;
}
