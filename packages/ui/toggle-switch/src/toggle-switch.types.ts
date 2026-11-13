/** Size of the switch. */
export type TxToggleSwitchSize = 'small' | 'medium' | 'large';
/** Side of the switch where the label sits. */
export type TxToggleSwitchLabelPosition = 'start' | 'end';
/** Parts of `tx-toggle-switch` that `pt` can style. */
export type TxToggleSwitchPart = 'root' | 'track' | 'input' | 'handle' | 'label' | 'description';

/** Event of `tx-toggle-switch` when the user flips it. */
export interface TxToggleSwitchChangeEvent {
  /** New state of the switch. */
  checked: boolean;
  /** The value of the switch for the new state. */
  value: unknown;
  /** The DOM event that caused the change. */
  originalEvent: Event;
}

/** Context of the custom handle template of `tx-toggle-switch`. */
export interface TxToggleSwitchHandleContext {
  /** Whether the switch is on. */
  $implicit: boolean;
}
