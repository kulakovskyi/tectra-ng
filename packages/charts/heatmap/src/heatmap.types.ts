export type TxHeatmapTone = 'success' | 'danger' | 'warn' | 'info' | 'pending' | 'neutral';

export interface TxHeatmapColumn {
  key: string;
  label: string;
}

export interface TxHeatmapColumnGroup {
  key: string;
  label: string;
  columns: TxHeatmapColumn[];
}

export interface TxHeatmapCell {
  tone?: TxHeatmapTone;
  value?: number | null;
  tooltip?: string;
  ariaLabel?: string;
  interactive?: boolean;
  hidden?: boolean;
  data?: unknown;
}

export interface TxHeatmapRow {
  key: string;
  label?: string;
  cells: (TxHeatmapCell | null)[];
  data?: unknown;
}

export interface TxHeatmapLegendItem {
  label: string;
  tone?: TxHeatmapTone;
  value?: number;
}

export interface TxHeatmapLabels {
  rowHeader: string;
  valueHeader: string;
  empty: string;
  region: string;
}

export interface TxHeatmapCellClick {
  row: TxHeatmapRow;
  cell: TxHeatmapCell;
  columnKey: string;
}

export interface TxHeatmapRowContext {
  $implicit: TxHeatmapRow;
  row: TxHeatmapRow;
}

export interface TxHeatmapCellSlot {
  columnKey: string;
  cell: TxHeatmapCell | null;
}

export interface TxHeatmapRowGroup {
  key: string;
  slots: TxHeatmapCellSlot[];
}

export interface TxHeatmapScale {
  min: number;
  max: number;
  steps: number;
}

export interface TxHeatmapCalendarValue {
  date: string | Date;
  value: number;
  tooltip?: string;
  data?: unknown;
}

export interface TxHeatmapCalendarOptions {
  from: string | Date;
  to: string | Date;
  intl?: string;
  firstDayOfWeek?: number;
  interactive?: boolean;
  format?: (value: number) => string;
}

export interface TxHeatmapCalendar {
  groups: TxHeatmapColumnGroup[];
  rows: TxHeatmapRow[];
}

export type TxHeatmapPart =
  | 'root'
  | 'scroll'
  | 'grid'
  | 'head'
  | 'row'
  | 'lead'
  | 'groups'
  | 'group'
  | 'groupLabel'
  | 'columns'
  | 'column'
  | 'value'
  | 'cell'
  | 'legend';
