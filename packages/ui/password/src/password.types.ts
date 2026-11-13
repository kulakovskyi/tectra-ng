/** Strength level of a password: `weak`, `medium` or `strong`. */
export type TxPasswordStrength = 'weak' | 'medium' | 'strong';
/** Size of `tx-password`: `small`, `medium` or `large`. */
export type TxPasswordSize = 'small' | 'medium' | 'large';
/** Look of the `tx-password` field: `outlined` or `filled`. */
export type TxPasswordVariant = 'outlined' | 'filled';
/** Parts of `tx-password` that `pt` can style. */
export type TxPasswordPart = 'root' | 'input' | 'toggle' | 'clear' | 'panel' | 'meter' | 'info';

/** Context of the strength panel templates of `tx-password`. */
export interface TxPasswordTemplateContext {
  /** Strength of the typed password, or `null` while it is empty. */
  $implicit: TxPasswordStrength | null;
  /** The typed password. */
  value: string;
}
