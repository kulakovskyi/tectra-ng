/** Size of select-like fields: `small`, `medium` or `large`. */
export type TxSelectSize = 'small' | 'medium' | 'large';
/** Look of a form field: `outlined` or `filled`. */
export type TxFieldVariant = 'outlined' | 'filled';
/** How the filter text is matched against an option: `contains`, `startsWith`, `endsWith` or `equals`. */
export type TxSelectFilterMatchMode = 'contains' | 'startsWith' | 'endsWith' | 'equals';

/** Parts of `tx-select` that `pt` can style. */
export type TxSelectPart =
  | 'root'
  | 'box'
  | 'trigger'
  | 'value'
  | 'clear'
  | 'dropdown'
  | 'panel'
  | 'header'
  | 'filter'
  | 'filterInput'
  | 'list'
  | 'group'
  | 'option'
  | 'check'
  | 'empty'
  | 'footer';

/** An option row of the list with its label, value and state. */
export interface TxSelectItem {
  /** Row kind; always `option`. */
  type: 'option';
  /** DOM id of the option element. */
  id: string;
  /** Position of the option in the option list. */
  index: number;
  /** Text shown for the option. */
  label: string;
  /** Value the option stands for. */
  value: unknown;
  /** The original option item. */
  option: unknown;
  /** Whether the option is selected. */
  selected: boolean;
  /** Whether the option cannot be picked. */
  disabled: boolean;
}

/** A group heading row of the option list. */
export interface TxSelectGroupRow {
  /** Row kind; always `group`. */
  type: 'group';
  /** DOM id of the group element. */
  id: string;
  /** Text of the group heading. */
  label: string;
  /** The original group item. */
  group: unknown;
}

/** A placeholder row for an option that is still loading (`lazy`). */
export interface TxSelectLoaderRow {
  /** Row kind; always `loader`. */
  type: 'loader';
  /** DOM id of the row element. */
  id: string;
  /** Position of the missing option in the option list. */
  index: number;
}

/** One row of an option list: an option, a group heading or a loading placeholder. */
export type TxSelectRow = TxSelectItem | TxSelectGroupRow | TxSelectLoaderRow;

/** Payload of the select change event: the new value and its option. */
export interface TxSelectChangeEvent {
  /** The selected value. */
  value: unknown;
  /** The option the value belongs to. */
  option: unknown;
}

/** Payload of the filter event. */
export interface TxSelectFilterEvent {
  /** The text typed into the filter. */
  query: string;
}

/** Payload of the lazy load event: the range of rows that came into view without data. */
export interface TxSelectLazyLoadEvent {
  /** Index of the first row to load. */
  first: number;
  /** Index of the last row to load. */
  last: number;
  /** The current filter text. */
  query: string;
}

/** Context of the option template of select-like components. */
export interface TxSelectOptionContext<T = unknown> {
  /** The option item. */
  $implicit: T;
  /** Whether the option is selected. */
  selected: boolean;
  /** Whether the option cannot be picked. */
  disabled: boolean;
  /** Position of the option in the option list. */
  index: number;
}

/** Context of the group header template of select-like components. */
export interface TxSelectGroupContext<T = unknown> {
  /** The group item of `options`. */
  $implicit: T;
}

/** Names of the option fields that a select-like component reads. */
export interface TxOptionFields {
  /** Field with the text of an option. */
  label: string;
  /** Field with the value of an option. */
  value: string;
  /** Field that marks an option as disabled. */
  disabled: string;
  /** Field with the heading of a group. */
  groupLabel: string;
  /** Field with the options of a group. */
  groupChildren: string;
  /** Field that identifies an object value, so a copy of an option is still found. */
  dataKey: string | undefined;
}
