/** Size of `tx-select-button`: `small`, `medium` or `large`. */
export type TxSelectButtonSize = 'small' | 'medium' | 'large';

/** Parts of `tx-select-button` that `pt` can style. */
export type TxSelectButtonPart = 'root' | 'item' | 'icon' | 'label';

/** Payload of the `changed` event of `tx-select-button`. */
export interface TxSelectButtonChangeEvent {
  /** The new value: one option value or `null`, or an array of values when `multiple` is on. */
  value: unknown;
  /** The option that was clicked or reached with the keyboard. */
  option: unknown;
  /** The DOM event that caused the change. */
  originalEvent: Event;
}

/** Context of the `txSelectButtonItem` template. */
export interface TxSelectButtonItemContext<T = unknown> {
  /** The option item of `options`. */
  $implicit: T;
  /** Text of the option, read with `optionLabel`. */
  label: string;
  /** Whether the option is selected. */
  selected: boolean;
  /** Whether the option cannot be picked. */
  disabled: boolean;
  /** Position of the option in `options`. */
  index: number;
}
