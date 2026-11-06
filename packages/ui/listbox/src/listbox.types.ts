import { TxSelectPart } from '@tectra-ng/ui/select';

export type TxListboxPart = Exclude<TxSelectPart, 'box' | 'trigger' | 'value' | 'clear' | 'dropdown' | 'panel'>;

export interface TxListboxChangeEvent {
  value: unknown;
  option: unknown;
}
