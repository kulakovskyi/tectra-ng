export type TxChipsInputSize = 'small' | 'medium' | 'large';
export type TxChipsInputVariant = 'outlined' | 'filled';
export type TxChipsInputPart = 'root' | 'list' | 'chip' | 'input' | 'clear';

export interface TxChipsInputItemContext {
  $implicit: string;
  index: number;
}

export interface TxChipsInputEvent {
  value: string;
  values: string[];
}
