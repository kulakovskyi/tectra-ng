import { TxSelectPart } from '@tectra-ng/ui/select';

/** What the dropdown button asks for: `blank` an empty query, `current` the text typed so far. */
export type TxAutocompleteDropdownMode = 'blank' | 'current';

/**
 * Names of the parts of `tx-autocomplete` that `pt` can style: the select parts plus the input, chip and dropdown button.
 */
export type TxAutocompletePart = TxSelectPart | 'input' | 'chip' | 'dropdownButton';

/** Payload of `completed`: the text to load suggestions for. */
export interface TxAutocompleteCompleteEvent {
  /** Text typed in the field; empty when the dropdown button asks with a blank query. */
  query: string;
}

/** Payload of `changed`: the new value and the suggestion behind it, if any. */
export interface TxAutocompleteChangeEvent {
  /** The new value of the field: a value, free text, or the list of values in multiple mode. */
  value: unknown;
  /** The suggestion the value comes from; `null` for free text. */
  option: unknown;
  /** `true` when the value matches a suggestion, `false` for free text or a removed chip. */
  selected: boolean;
}
