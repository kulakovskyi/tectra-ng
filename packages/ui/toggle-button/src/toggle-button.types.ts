/** Size of the toggle button. */
export type TxToggleButtonSize = 'small' | 'medium' | 'large';
/** Side of the label where the icon sits. */
export type TxToggleButtonIconPosition = 'left' | 'right';
/** Parts of `tx-toggle-button` that `pt` can style. */
export type TxToggleButtonPart = 'root' | 'content' | 'icon' | 'label';

/** Event of `tx-toggle-button` when the user switches it. */
export interface TxToggleButtonChangeEvent {
  /** The DOM event that caused the change. */
  originalEvent: Event;
  /** New state of the button. */
  checked: boolean;
}
