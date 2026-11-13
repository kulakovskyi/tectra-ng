/** Size of a checkbox: `small`, `medium` or `large`. */
export type TxCheckboxSize = 'small' | 'medium' | 'large';
/** Look of the box: `outlined` or `filled`. */
export type TxCheckboxVariant = 'outlined' | 'filled';
/** Names of the parts of `tx-checkbox` that `pt` can style. */
export type TxCheckboxPart = 'root' | 'box' | 'input' | 'icon' | 'label' | 'description';
/** Names of the parts of `tx-checkbox-group` that `pt` can style. */
export type TxCheckboxGroupPart = 'root' | 'selectAll' | 'items';
/** Direction the checkboxes of a group line up: `vertical` or `horizontal`. */
export type TxCheckboxGroupOrientation = 'vertical' | 'horizontal';

/** Payload of `changed`: the new state, the value written to the model and the DOM event. */
export interface TxCheckboxChangeEvent {
  /** Whether the checkbox is now checked. */
  checked: boolean;
  /** The new model value: the true or false value, or the updated list of values in a group. */
  value: unknown;
  /** The DOM event that caused the change. */
  originalEvent: Event;
}

/** Context of the custom check icon template. */
export interface TxCheckboxIconContext {
  /** Whether the checkbox is checked. */
  $implicit: boolean;
  /** Whether the checkbox shows the mixed state. */
  indeterminate: boolean;
}
