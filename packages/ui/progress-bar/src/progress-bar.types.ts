/** `determinate` shows a known value, `indeterminate` a moving bar while the length is unknown. */
export type TxProgressBarMode = 'determinate' | 'indeterminate';
/** Colour of the progress bar value: `primary`, `secondary` or a severity. */
export type TxProgressBarSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
/** Size of `tx-progress-bar`; `normal` is the same as `medium`. */
export type TxProgressBarSize = 'small' | 'medium' | 'normal' | 'large';
/** Parts of `tx-progress-bar` that `pt` can style. */
export type TxProgressBarPart = 'root' | 'track' | 'value' | 'label';

/** Context of the `txProgressBarValue` label template. */
export interface TxProgressBarValueContext {
  /** The current value. */
  $implicit: number;
  /** The current value as a percentage of the range. */
  percent: number;
}
