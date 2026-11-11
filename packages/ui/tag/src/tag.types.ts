export type TxTagSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
export type TxTagSize = 'small' | 'medium' | 'normal' | 'large';
export type TxTagPart = 'root' | 'icon' | 'label' | 'copy' | 'remove';
export type TxTagListPart = 'root' | 'tag' | 'more' | 'popover';

export interface TxTagListItem {
  readonly value: string;
  readonly severity?: TxTagSeverity;
  readonly icon?: string;
  readonly tooltip?: string;
}
