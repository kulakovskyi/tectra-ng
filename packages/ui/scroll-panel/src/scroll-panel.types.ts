/** Parts of `tx-scroll-panel` that `pt` can style. */
export type TxScrollPanelPart = 'root' | 'content' | 'barX' | 'barY';

/** Scroll direction: `x` for horizontal, `y` for vertical. */
export type TxScrollPanelAxis = 'x' | 'y';

/**
 * Measured state of one custom scrollbar: whether it shows, its thumb size and position, and the
 * scroll progress.
 */
export interface TxScrollPanelBar {
  /** Whether the content overflows on this axis, so the bar is shown. */
  visible: boolean;
  /** Length of the thumb, in px. */
  length: number;
  /** Distance of the thumb from the start of the track, in px. */
  offset: number;
  /** Scroll progress along this axis, in percent (0 – 100). */
  value: number;
}
