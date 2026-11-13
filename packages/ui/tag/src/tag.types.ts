/** Colour role of a tag. */
export type TxTagSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
/** Size of a tag. */
export type TxTagSize = 'small' | 'medium' | 'normal' | 'large';
/** Parts of `tx-tag` that `pt` can style. */
export type TxTagPart = 'root' | 'icon' | 'label' | 'copy' | 'remove';
/** Parts of `tx-tag-list` that `pt` can style. */
export type TxTagListPart = 'root' | 'tag' | 'more' | 'popover';

/** One tag of `tx-tag-list`. */
export interface TxTagListItem {
  /** Text of the tag. */
  readonly value: string;
  /** Colour role of the tag. */
  readonly severity?: TxTagSeverity;
  /** Icon before the text. */
  readonly icon?: string;
  /** Tooltip text of the tag. */
  readonly tooltip?: string;
}
