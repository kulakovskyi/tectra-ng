/** Size of `tx-radio-button`: `small`, `medium` or `large`. */
export type TxRadioButtonSize = 'small' | 'medium' | 'large';
/** Look of the radio box: `outlined` or `filled`. */
export type TxRadioButtonVariant = 'outlined' | 'filled';
/** Parts of `tx-radio-button` that `pt` can style. */
export type TxRadioButtonPart = 'root' | 'box' | 'input' | 'dot' | 'label' | 'description';
/** Parts of `tx-radio-group` that `pt` can style. */
export type TxRadioGroupPart = 'root';
/** Direction the buttons of a radio group are laid out: `vertical` or `horizontal`. */
export type TxRadioGroupOrientation = 'vertical' | 'horizontal';

/** Payload of the radio change event: the chosen value and the DOM event. */
export interface TxRadioButtonChangeEvent {
  /** Value of the radio button that was selected. */
  value: unknown;
  /** The DOM event that caused the change. */
  originalEvent: Event;
}
