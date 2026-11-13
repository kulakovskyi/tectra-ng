/**
 * Meaning of the action, which sets the colour: `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help` or `contrast`.
 */
export type TxButtonSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
/** Size of a button: `small`, `medium` or `large`. */
export type TxButtonSize = 'small' | 'medium' | 'large';
/** Look of a button without the filled default: `outlined`, `text` or `link`. */
export type TxButtonVariant = 'outlined' | 'text' | 'link';
/** Where the icon sits next to the label: `left`, `right`, `top` or `bottom`. */
export type TxButtonIconPosition = 'left' | 'right' | 'top' | 'bottom';
/** Names of the parts of `tx-button` that `pt` can style. */
export type TxButtonPart = 'root' | 'icon' | 'loadingIcon' | 'label' | 'badge';
