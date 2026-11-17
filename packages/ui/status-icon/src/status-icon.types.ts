/** Parts of `tx-status-icon` that `pt` can style. */
export type TxStatusIconPart = 'root' | 'icon';

/** Colour and icon of a status icon: `success`, `info`, `warn`, `danger` or `secondary`. */
export type TxStatusIconSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

/** Size of `tx-status-icon`: `small`, `medium` or `large`. */
export type TxStatusIconSize = 'small' | 'medium' | 'large';

/** Hint of `tx-status-icon`: `true` shows the label in a kit tooltip, `false` in the native title, `'none'` shows none. */
export type TxStatusIconTooltip = boolean | 'none';
