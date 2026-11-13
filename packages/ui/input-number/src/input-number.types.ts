/** Plain number (`decimal`) or an amount with a currency (`currency`). */
export type TxInputNumberMode = 'decimal' | 'currency';
/** Where the step buttons go: stacked on the right, on both sides, or one above the other. */
export type TxInputNumberButtonLayout = 'stacked' | 'horizontal' | 'vertical';
/** Size of `tx-input-number`. */
export type TxInputNumberSize = 'small' | 'medium' | 'large';
/** Look of `tx-input-number`: outlined or filled. */
export type TxInputNumberVariant = 'outlined' | 'filled';
/** How the currency is written: symbol, narrow symbol, ISO code or full name. */
export type TxInputNumberCurrencyDisplay = 'symbol' | 'narrowSymbol' | 'code' | 'name';
/** Parts of `tx-input-number` that `pt` can style. */
export type TxInputNumberPart = 'root' | 'input' | 'increment' | 'decrement' | 'clear';

/** Event of `changed`: the user changed the number. */
export interface TxInputNumberChangeEvent {
  /** New value; `null` when the field is empty. */
  value: number | null;
  /** Browser event that caused the change. */
  originalEvent: Event;
}
