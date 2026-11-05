export type TxSelectSize = 'small' | 'medium' | 'large';
export type TxFieldVariant = 'outlined' | 'filled';
export type TxFilterMatchMode = 'contains' | 'startsWith' | 'endsWith' | 'equals';

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

export interface TxSelectItem {
  type: 'option';
  id: string;
  index: number;
  label: string;
  value: unknown;
  option: unknown;
  selected: boolean;
  disabled: boolean;
}

export interface TxSelectGroupRow {
  type: 'group';
  id: string;
  label: string;
  group: unknown;
}

export interface TxSelectLoaderRow {
  type: 'loader';
  id: string;
  index: number;
}

export type TxSelectRow = TxSelectItem | TxSelectGroupRow | TxSelectLoaderRow;

export interface TxSelectChangeEvent {
  value: unknown;
  option: unknown;
}

export interface TxSelectFilterEvent {
  query: string;
}

export interface TxSelectLazyLoadEvent {
  first: number;
  last: number;
  query: string;
}

export interface TxSelectOptionContext {
  $implicit: unknown;
  selected: boolean;
  disabled: boolean;
  index: number;
}

export interface TxOptionFields {
  label: string;
  value: string;
  disabled: string;
  groupLabel: string;
  groupChildren: string;
  dataKey: string | undefined;
}
