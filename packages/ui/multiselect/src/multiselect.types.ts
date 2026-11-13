import { TxSelectPart } from '@tectra-ng/ui/select';

/** How selected values show in the closed field: `comma` text or removable `chip` elements. */
export type TxMultiselectDisplay = 'comma' | 'chip';

/** Parts of `tx-multiselect` that `pt` can style: the select parts plus `chip` and `toggleAll`. */
export type TxMultiselectPart = TxSelectPart | 'chip' | 'toggleAll';

/** Payload of the multiselect change event: the new value list and the option that was toggled. */
export interface TxMultiselectChangeEvent {
  /** All selected values after the change. */
  value: unknown[];
  /** The option that was selected or unselected. */
  option: unknown;
  /** `true` when the option was selected, `false` when it was removed. */
  selected: boolean;
}
