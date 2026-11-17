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
  /** The list of chips after the change; for a rejected value, the list after the whole input (a paste, an `add()` call) was handled. */
  values: string[];
}

/** Why a value was not added: already in the list, the list is full, no match with `itemPattern`, or longer than `maxLength`. */
export type TxChipsInputRejectReason = 'duplicate' | 'max' | 'pattern' | 'length';

/** What `maxLength` does with a longer value: cut it (`truncate`) or refuse it (`reject`). */
export type TxChipsInputLengthMode = 'truncate' | 'reject';

/** Turns a trimmed value into the chip text before the checks; `null` or `''` drops the value. */
export type TxChipsInputNormalizer = (value: string) => string | null | undefined;

/** Payload of `rejected`: the refused value, the list after the whole input was handled and the reason. */
export interface TxChipsInputRejectedEvent extends TxChipsInputEvent {
  /** Why the value was not added. */
  reason: TxChipsInputRejectReason;
}

/** Payload of `committed`: everything one Enter, separator, blur, paste or `add()` call did. */
export interface TxChipsInputCommitEvent {
  /** Values added, in order. */
  added: string[];
  /** Values refused, with their reasons. */
  rejected: TxChipsInputRejectedEvent[];
  /** The list of chips after the change. */
  values: string[];
}
