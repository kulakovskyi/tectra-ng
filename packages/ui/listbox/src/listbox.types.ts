import { TxSelectPart } from '@tectra-ng/ui/select';

/** Parts of `tx-listbox` that `pt` can style. */
export type TxListboxPart = Exclude<TxSelectPart, 'box' | 'trigger' | 'value' | 'clear' | 'dropdown' | 'panel'>;

/** Event of `tx-listbox` when the selection changes. */
export interface TxListboxChangeEvent {
  /** Model value after the change. */
  value: unknown;
  /** Option that was picked or toggled; `null` when nothing is left selected. */
  option: unknown;
}
