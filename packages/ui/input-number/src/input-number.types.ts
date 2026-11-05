export type TxInputNumberMode = 'decimal' | 'currency';
export type TxInputNumberButtonLayout = 'stacked' | 'horizontal' | 'vertical';
export type TxInputNumberSize = 'small' | 'medium' | 'large';
export type TxInputNumberVariant = 'outlined' | 'filled';
export type TxInputNumberCurrencyDisplay = 'symbol' | 'narrowSymbol' | 'code' | 'name';
export type TxInputNumberPart = 'root' | 'input' | 'increment' | 'decrement' | 'clear';

export interface TxInputNumberChangeEvent {
  value: number | null;
  originalEvent: Event;
}
