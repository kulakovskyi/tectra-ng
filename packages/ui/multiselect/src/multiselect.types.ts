import { TxSelectPart } from '@tectra-ng/ui/select';

export type TxMultiselectDisplay = 'comma' | 'chip';

export type TxMultiselectPart = TxSelectPart | 'chip' | 'toggleAll';

export interface TxMultiselectChangeEvent {
  value: unknown[];
  option: unknown;
  selected: boolean;
}
