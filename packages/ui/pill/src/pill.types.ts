/**
 * Colour of `tx-pill`: `neutral`, `primary`, a severity, `help` or `contrast`; `secondary` is the same as
 * `neutral`, so the severities of `tx-tag` and `tx-badge` work here too.
 */
export type TxPillTone = 'neutral' | 'secondary' | 'primary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
/** Look of `tx-pill`: `soft` (tinted), `solid` or `outline`. */
export type TxPillVariant = 'soft' | 'solid' | 'outline';
/** Size of `tx-pill`; `normal` is the same as `medium`. */
export type TxPillSize = 'small' | 'medium' | 'normal' | 'large';
/** Parts of `tx-pill` that `pt` can style. */
export type TxPillPart = 'root' | 'icon' | 'leading' | 'label' | 'remove';
