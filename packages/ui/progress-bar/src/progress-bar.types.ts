export type TxProgressBarMode = 'determinate' | 'indeterminate';
export type TxProgressBarSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
export type TxProgressBarSize = 'small' | 'medium' | 'normal' | 'large';
export type TxProgressBarPart = 'root' | 'track' | 'value' | 'label';

export interface TxProgressBarValueContext {
  $implicit: number;
  percent: number;
}
