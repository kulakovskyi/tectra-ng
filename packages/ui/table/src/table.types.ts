import { TxPageState } from '@tectra/ui/paginator';

export type TxTableSize = 'small' | 'medium' | 'large';
export type TxSortOrder = 'asc' | 'desc' | null;
export type TxTableSortMode = 'single' | 'multiple';
export type TxTableSelectionMode = 'single' | 'multiple' | 'checkbox' | 'radio';
export type TxTableColumnResizeMode = 'fit' | 'expand';
export type TxTableStateStorage = 'local' | 'session';
export type TxTableFrozen = 'start' | 'end';
export type TxTableAlign = 'start' | 'center' | 'end';
export type TxTablePaginatorPosition = 'top' | 'bottom' | 'both';
export type TxTableRowKey = string | number;

export type TxTablePart =
  | 'root'
  | 'toolbar'
  | 'frame'
  | 'scroller'
  | 'table'
  | 'thead'
  | 'headerRow'
  | 'headerCell'
  | 'sortButton'
  | 'sortIcon'
  | 'tbody'
  | 'row'
  | 'cell'
  | 'tfoot'
  | 'footerCell'
  | 'loading'
  | 'empty'
  | 'paginator'
  | 'cards'
  | 'card';

export interface TxTableColumn {
  field: string;
  header?: string;
  sortable?: boolean;
  sortField?: string;
  reorderable?: boolean;
  resizable?: boolean;
  hideable?: boolean;
  hidden?: boolean;
  width?: string;
  initialWidth?: string;
  minWidth?: string;
  maxWidth?: string;
  frozen?: TxTableFrozen;
  align?: TxTableAlign;
  headerClass?: string;
  cellClass?: string;
  footer?: string;
  cardTitle?: boolean;
  hideInCard?: boolean;
}

export interface TxSortMeta {
  field: string;
  order: Exclude<TxSortOrder, null>;
}

export interface TxTableSortEvent {
  field: string | null;
  order: TxSortOrder;
  multiSortMeta: TxSortMeta[];
}

export interface TxTableLazyLoadEvent {
  first: number;
  rows: number;
  sortField: string | null;
  sortOrder: TxSortOrder;
  multiSortMeta: TxSortMeta[];
}

export type TxTablePageEvent = TxPageState;

export interface TxTableRowEvent<T = unknown> {
  row: T;
  index: number;
  originalEvent?: Event;
}

export interface TxTableColumnResizeEvent {
  field: string;
  width: number;
}

export interface TxTableColumnReorderEvent {
  columns: TxTableColumn[];
  from: number;
  to: number;
}

export interface TxTableState {
  widths?: Record<string, number>;
  order?: string[];
  hidden?: string[];
  sortField?: string | null;
  sortOrder?: TxSortOrder;
  multiSortMeta?: TxSortMeta[];
  first?: number;
  rows?: number;
  actionOrder?: string[];
  pinnedActions?: string[];
}

export interface TxTableCellContext<T = unknown> {
  $implicit: T;
  row: T;
  index: number;
  column: TxTableColumn;
  value: unknown;
}

export interface TxTableHeaderContext {
  $implicit: TxTableColumn;
}

export interface TxTableRowContext<T = unknown> {
  $implicit: T;
  index: number;
}

export interface TxTableEmptyContext {
  $implicit: number;
}

export interface TxTableActionConfig {
  label: string;
  id?: string;
}

export interface TxTableActionItem {
  id: string;
  label: string;
}
