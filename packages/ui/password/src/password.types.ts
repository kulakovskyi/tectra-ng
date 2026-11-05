export type TxPasswordStrength = 'weak' | 'medium' | 'strong';
export type TxPasswordSize = 'small' | 'medium' | 'large';
export type TxPasswordVariant = 'outlined' | 'filled';
export type TxPasswordPart = 'root' | 'input' | 'toggle' | 'clear' | 'panel' | 'meter' | 'info';

export interface TxPasswordTemplateContext {
  $implicit: TxPasswordStrength | null;
  value: string;
}
