import { TxPageState } from '@tectra-ng/ui/paginator';

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
export type TxTableFilterDisplay = 'menu' | 'row';
export type TxTableEditMode = 'cell' | 'row';
export type TxTableRowGroupMode = 'subheader' | 'rowspan';
export type TxTableEditType = 'text' | 'numeric' | 'date' | 'boolean';
export type TxTableFilterType = 'text' | 'numeric' | 'date' | 'boolean';
export type TxFilterOperator = 'and' | 'or';
export type TxFilterMatchMode =
  | 'startsWith'
  | 'contains'
  | 'notContains'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'dateIs'
  | 'dateIsNot'
  | 'dateBefore'
  | 'dateAfter';

export interface TxFilterRule {
  value: unknown;
  matchMode: TxFilterMatchMode;
}

export interface TxColumnFilter {
  operator: TxFilterOperator;
  rules: TxFilterRule[];
}

export type TxTableFilters = Record<string, TxColumnFilter>;

export interface TxTableFilterOption {
  label: string;
  value: unknown;
}

export interface TxTableFilterEvent<T = unknown> {
  filters: TxTableFilters;
  globalFilter: string;
  filteredValue: T[];
}

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
  filter?: boolean;
  filterField?: string;
  filterType?: TxTableFilterType;
  filterMatchModes?: TxFilterMatchMode[];
  filterOptions?: TxTableFilterOption[];
  filterPlaceholder?: string;
  editable?: boolean;
  editType?: TxTableEditType;
  editOptions?: TxTableFilterOption[];
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
  filters: TxTableFilters;
  globalFilter: string;
}

export type TxTablePageEvent = TxPageState;

export interface TxTableRowEvent<T = unknown> {
  row: T;
  index: number;
  originalEvent?: Event;
}

export interface TxTableRowReorderEvent<T = unknown> {
  from: number;
  to: number;
  value: T[];
}

export interface TxTableGroupContext<T = unknown> {
  $implicit: T;
  value: unknown;
  count: number;
  rows: T[];
  collapsed: boolean;
  toggle: () => void;
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
  filters?: TxTableFilters;
  globalFilter?: string;
  actionOrder?: string[];
  pinnedActions?: string[];
}

export interface TxTableCellEditEvent<T = unknown> {
  row: T;
  index: number;
  field: string;
  value: unknown;
  previousValue: unknown;
}

export interface TxTableRowEditEvent<T = unknown> {
  row: T;
  index: number;
  changes: Record<string, unknown>;
  previous: Record<string, unknown>;
}

export interface TxTableEditorContext<T = unknown> {
  $implicit: T;
  row: T;
  index: number;
  column: TxTableColumn;
  value: unknown;
  set: (value: unknown) => void;
  commit: () => void;
  cancel: () => void;
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
