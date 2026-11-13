import { TxPageState } from '@tectra-ng/ui/paginator';

/** Size of `tx-table`: `small`, `medium` or `large`. */
export type TxTableSize = 'small' | 'medium' | 'large';
/** Sort direction of a column: `asc`, `desc` or `null` for unsorted. */
export type TxSortOrder = 'asc' | 'desc' | null;
/** Whether one column (`single`) or several (`multiple`) can be sorted at once. */
export type TxTableSortMode = 'single' | 'multiple';
/** How rows are selected: `single`, `multiple`, `checkbox` or `radio`. */
export type TxTableSelectionMode = 'single' | 'multiple' | 'checkbox' | 'radio';
/** What a column resize does: `expand` changes only that column, `fit` takes the width from the next column. */
export type TxTableColumnResizeMode = 'fit' | 'expand';
/** Browser storage that keeps the table state: `local` or `session`. */
export type TxTableStateStorage = 'local' | 'session';
/** Side a frozen column sticks to: `start` or `end`. */
export type TxTableFrozen = 'start' | 'end';
/** Horizontal alignment of a column: `start`, `center` or `end`. */
export type TxTableAlign = 'start' | 'center' | 'end';
/** Where the paginator shows: `top`, `bottom` or `both`. */
export type TxTablePaginatorPosition = 'top' | 'bottom' | 'both';
/** Identifier of a row: a string or a number. */
export type TxTableRowKey = string | number;
/** How column filters are offered: in a `menu` or in a `row` under the headers. */
export type TxTableFilterDisplay = 'menu' | 'row';
/** Whether `cell` or the whole `row` goes into edit. */
export type TxTableEditMode = 'cell' | 'row';
/** How row groups show: a `subheader` row or a `rowspan` cell. */
export type TxTableRowGroupMode = 'subheader' | 'rowspan';
/** Editor of a column: `text`, `numeric`, `date` or `boolean`. */
export type TxTableEditType = 'text' | 'numeric' | 'date' | 'boolean';
/** Filter of a column: `text`, `numeric`, `date` or `boolean`. */
export type TxTableFilterType = 'text' | 'numeric' | 'date' | 'boolean';
/** How the rules of one column filter combine: `and` or `or`. */
export type TxFilterOperator = 'and' | 'or';
/** How a filter value is compared with a cell: text, number, list, range and date comparisons. */
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

/** One condition of a column filter: a value and how to compare it. */
export interface TxFilterRule {
  /** Value to compare with; an empty value is ignored. */
  value: unknown;
  /** How the cell value is compared with the filter value. */
  matchMode: TxFilterMatchMode;
}

/** The filter of one column: its rules and how they combine. */
export interface TxColumnFilter {
  /** Whether all rules (`and`) or any rule (`or`) must match. */
  operator: TxFilterOperator;
  /** Conditions of the filter. */
  rules: TxFilterRule[];
}

/** Column filters by column field. */
export type TxTableFilters = Record<string, TxColumnFilter>;

/** An option of a column filter or editor: label and value. */
export interface TxTableFilterOption {
  /** Text shown for the option. */
  label: string;
  /** Value the option stands for. */
  value: unknown;
}

/** Payload of the table filter event: the filters and the rows that pass them. */
export interface TxTableFilterEvent<T = unknown> {
  /** Column filters by field. */
  filters: TxTableFilters;
  /** Text of the global search. */
  globalFilter: string;
  /** Rows that pass the filters. */
  filteredValue: T[];
}

/** Parts of `tx-table` that `pt` can style. */
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
  | 'card'
  | 'treeToggle';

/** Definition of one table column: field, header, sorting, sizing, filtering and editing. */
export interface TxTableColumn {
  /** Row field the column shows; a dot reads a nested value, e.g. `team.name`. */
  field: string;
  /** Header text; the field name without it. */
  header?: string;
  /** Whether the column can be sorted; on unless `false`. */
  sortable?: boolean;
  /** Field to sort by instead of `field`. */
  sortField?: string;
  /** Whether the column can be dragged to another position. */
  reorderable?: boolean;
  /** Whether the column width can be changed by dragging. */
  resizable?: boolean;
  /** Whether the user can hide the column in the settings. */
  hideable?: boolean;
  /** Whether the column starts hidden. */
  hidden?: boolean;
  /** Fixed width as a CSS length; the column is not resizable. */
  width?: string;
  /** Starting width as a CSS length, until the column is resized. */
  initialWidth?: string;
  /** Smallest width as a CSS length. */
  minWidth?: string;
  /** Largest width as a CSS length. */
  maxWidth?: string;
  /** Sticks the column to the `start` or `end` side while the table scrolls. */
  frozen?: TxTableFrozen;
  /** Horizontal alignment of the header and cells: `start`, `center` or `end`. */
  align?: TxTableAlign;
  /** CSS class added to the header cell. */
  headerClass?: string;
  /** CSS class added to the body cells. */
  cellClass?: string;
  /** Footer text of the column. */
  footer?: string;
  /** Makes this column the title of the card on narrow screens. */
  cardTitle?: boolean;
  /** Leaves the column out of the card on narrow screens. */
  hideInCard?: boolean;
  /** Turns on the filter of the column. */
  filter?: boolean;
  /** Field to filter by instead of `field`. */
  filterField?: string;
  /** Kind of filter: `text`, `numeric`, `date` or `boolean`. */
  filterType?: TxTableFilterType;
  /** Match modes the filter offers; the first one is the default. */
  filterMatchModes?: TxFilterMatchMode[];
  /** Options for a multi select filter that uses the `in` match mode. */
  filterOptions?: TxTableFilterOption[];
  /** Placeholder of the filter input. */
  filterPlaceholder?: string;
  /** Whether the cells of the column can be edited. */
  editable?: boolean;
  /** Kind of editor: `text`, `numeric`, `date` or `boolean`. */
  editType?: TxTableEditType;
  /** Options for a select editor. */
  editOptions?: TxTableFilterOption[];
}

/** One sorted column: its field and direction. */
export interface TxSortMeta {
  /** Field of the sorted column. */
  field: string;
  /** Sort direction: `asc` or `desc`. */
  order: Exclude<TxSortOrder, null>;
}

/** Payload of the table sort event: the sorted column and the full multi-sort list. */
export interface TxTableSortEvent {
  /** Field of the sorted column, or `null` when the sort was cleared. */
  field: string | null;
  /** Sort direction of that column. */
  order: TxSortOrder;
  /** All sorted columns, in sort order. */
  multiSortMeta: TxSortMeta[];
}

/** Payload of the lazy load event: the page, sort and filters to load from the server. */
export interface TxTableLazyLoadEvent {
  /** Index of the first row to load. */
  first: number;
  /** Number of rows to load. */
  rows: number;
  /** Field of the sorted column, or `null`. */
  sortField: string | null;
  /** Sort direction of that column. */
  sortOrder: TxSortOrder;
  /** All sorted columns, in sort order. */
  multiSortMeta: TxSortMeta[];
  /** Column filters by field. */
  filters: TxTableFilters;
  /** Text of the global search. */
  globalFilter: string;
}

/** Payload of the table page event: the paginator state. */
export type TxTablePageEvent = TxPageState;

/** Payload of the row events: the row, its position and the DOM event. */
export interface TxTableRowEvent<T = unknown> {
  /** The row. */
  row: T;
  /** Position of the row. */
  index: number;
  /** The DOM event that caused it, when there is one. */
  originalEvent?: Event;
}

/** Payload of the row reorder event: the move and the new row order. */
export interface TxTableRowReorderEvent<T = unknown> {
  /** Old position of the row. */
  from: number;
  /** New position of the row. */
  to: number;
  /** The rows in the new order; set it as `value`. */
  value: T[];
}

/** Context of the group header and group footer templates. */
export interface TxTableGroupContext<T = unknown> {
  /** First row of the group. */
  $implicit: T;
  /** Value of the field the rows are grouped by. */
  value: unknown;
  /** Number of rows in the group. */
  count: number;
  /** Rows of the group. */
  rows: T[];
  /** Whether the group is collapsed. */
  collapsed: boolean;
  /** Collapses or expands the group. */
  toggle: () => void;
}

/** Payload of the column resize event. */
export interface TxTableColumnResizeEvent {
  /** Field of the resized column. */
  field: string;
  /** New width of the column, in px. */
  width: number;
}

/** Payload of the column reorder event: the new column order and the move. */
export interface TxTableColumnReorderEvent {
  /** The columns in the new order. */
  columns: TxTableColumn[];
  /** Old position of the column. */
  from: number;
  /** New position of the column. */
  to: number;
}

/**
 * View state saved under `stateKey`: widths, order, hidden columns, sort, page, filters and action
 * settings.
 */
export interface TxTableState {
  /** Column widths in px by field. */
  widths?: Record<string, number>;
  /** Fields of the columns in display order. */
  order?: string[];
  /** Fields of the hidden columns. */
  hidden?: string[];
  /** Field of the sorted column, or `null`. */
  sortField?: string | null;
  /** Sort direction of that column. */
  sortOrder?: TxSortOrder;
  /** All sorted columns, in sort order. */
  multiSortMeta?: TxSortMeta[];
  /** Index of the first row of the current page. */
  first?: number;
  /** Number of rows per page. */
  rows?: number;
  /** Column filters by field. */
  filters?: TxTableFilters;
  /** Text of the global search. */
  globalFilter?: string;
  /** Ids of the row actions in display order. */
  actionOrder?: string[];
  /** Ids of the row actions shown inline instead of in the popover. */
  pinnedActions?: string[];
}

/** Payload of the cell edit events. */
export interface TxTableCellEditEvent<T = unknown> {
  /** The row being edited. */
  row: T;
  /** Position of the row. */
  index: number;
  /** Field of the edited cell. */
  field: string;
  /** Current value of the cell. */
  value: unknown;
  /** Value of the cell before the edit. */
  previousValue: unknown;
}

/** Payload of the row edit events. */
export interface TxTableRowEditEvent<T = unknown> {
  /** The row being edited. */
  row: T;
  /** Position of the row. */
  index: number;
  /** Changed values by field. */
  changes: Record<string, unknown>;
  /** Values before the edit by field. */
  previous: Record<string, unknown>;
}

/** Context of the `txTableEditor` template of a column. */
export interface TxTableEditorContext<T = unknown> {
  /** The row being edited. */
  $implicit: T;
  /** The row being edited. */
  row: T;
  /** Position of the row. */
  index: number;
  /** The column being edited. */
  column: TxTableColumn;
  /** Current value of the editor. */
  value: unknown;
  /** Sets the value of the editor. */
  set: (value: unknown) => void;
  /** Saves the edit. */
  commit: () => void;
  /** Cancels the edit. */
  cancel: () => void;
}

/** Context of the `txTableCell` template of a column. */
export interface TxTableCellContext<T = unknown> {
  /** The row. */
  $implicit: T;
  /** The row. */
  row: T;
  /** The tree node of the row, when the table shows a tree. */
  node: unknown;
  /** Position of the row. */
  index: number;
  /** The column of the cell. */
  column: TxTableColumn;
  /** Value of the column field in the row. */
  value: unknown;
}

/** Context of the header and footer cell templates. */
export interface TxTableHeaderContext {
  /** The column. */
  $implicit: TxTableColumn;
}

/** Context of the row templates: actions, expansion and card. */
export interface TxTableRowContext<T = unknown> {
  /** The row. */
  $implicit: T;
  /** The tree node of the row, when the table shows a tree. */
  node: unknown;
  /** Position of the row. */
  index: number;
}

/** Context of the `txTableEmpty` template. */
export interface TxTableEmptyContext {
  /** Number of data columns, e.g. for a `colspan`. */
  $implicit: number;
}

/** Config of a `*txTableAction`: its label and id. */
export interface TxTableActionConfig {
  /** Text of the action in the settings and the right-click menu. */
  label: string;
  /** Id of the action; a slug of the label by default. */
  id?: string;
}

/** A registered row action as the settings list shows it. */
export interface TxTableActionItem {
  /** Id of the action. */
  id: string;
  /** Text of the action. */
  label: string;
}
