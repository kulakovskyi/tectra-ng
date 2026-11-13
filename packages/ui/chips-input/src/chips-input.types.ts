/** Size of the field: `small`, `medium` or `large`. */
export type TxChipsInputSize = 'small' | 'medium' | 'large';
/** Look of the field: `outlined` or `filled`. */
export type TxChipsInputVariant = 'outlined' | 'filled';
/** Names of the parts of `tx-chips-input` that `pt` can style. */
export type TxChipsInputPart = 'root' | 'list' | 'chip' | 'input' | 'clear';

/** Context of the `txChipsInputItem` template. */
export interface TxChipsInputItemContext {
  /** Text of the chip, so `let-value` works. */
  $implicit: string;
  /** Position of the chip. */
  index: number;
}

/** Payload of `added`, `removed` and `rejected`: the value concerned and the whole list. */
export interface TxChipsInputEvent {
  /** The chip text that was added, removed or rejected. */
  value: string;
  /** The list of chips after the change; unchanged for a rejected value. */
  values: string[];
}
