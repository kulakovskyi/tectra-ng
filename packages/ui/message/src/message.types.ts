/** Color role of `tx-message`. */
export type TxMessageSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
/** Size of `tx-message`. */
export type TxMessageSize = 'small' | 'medium' | 'large';
/** Look of `tx-message`: outlined, text only or simple. */
export type TxMessageVariant = 'outlined' | 'text' | 'simple';
/** Parts of `tx-message` that `pt` can style. */
export type TxMessagePart = 'root' | 'icon' | 'content' | 'closeButton';
/** Tone of a field hint: neutral (`secondary`) or `success`. */
export type TxFieldHintSeverity = 'secondary' | 'success';
/** Parts of a field hint or error that `pt` can style. */
export type TxFieldMessagePart = 'root' | 'icon' | 'text';
