import { TxSelectPart } from '@tectra-ng/ui/select';

export type TxAutocompleteDropdownMode = 'blank' | 'current';

export type TxAutocompletePart = TxSelectPart | 'input' | 'chip' | 'dropdownButton';

export interface TxAutocompleteCompleteEvent {
  query: string;
}

export interface TxAutocompleteChangeEvent {
  value: unknown;
  option: unknown;
  selected: boolean;
}
