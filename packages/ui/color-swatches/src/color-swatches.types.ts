/** Size of `tx-color-swatches`: `small`, `medium` or `large`. */
export type TxColorSwatchesSize = 'small' | 'medium' | 'large';
/** Parts of `tx-color-swatches` that `pt` can style. */
export type TxColorSwatchesPart = 'root' | 'group' | 'swatch' | 'check';

/** One color dot of `tx-color-swatches`. */
export interface TxColorSwatchOption<T = string> {
  /** Value the control takes when this dot is picked. */
  value: T;
  /** CSS color of the dot. */
  color: string;
  /** Name of the color, read by screen readers and shown as the tooltip. */
  label: string;
  /** Whether the dot cannot be picked. */
  disabled?: boolean;
}

/** Payload of the change event of `tx-color-swatches`: the picked value and the DOM event. */
export interface TxColorSwatchesChangeEvent<T = string> {
  /** The picked value. */
  value: T;
  /** The click or key event that picked it. */
  originalEvent: Event;
}
