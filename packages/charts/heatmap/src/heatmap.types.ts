/** Color of a heatmap cell: `info` is striped and `pending` is outlined. */
export type TxHeatmapTone = 'success' | 'danger' | 'warn' | 'info' | 'pending' | 'neutral';

/** One column of `tx-heatmap`. */
export interface TxHeatmapColumn {
  /** Unique key of the column, passed to `cellClick`. */
  key: string;
  /** Text in the column header. */
  label: string;
}

/** A band of columns of `tx-heatmap` under one header, such as the days of a week or the hours of a day. */
export interface TxHeatmapColumnGroup {
  /** Unique key of the band. */
  key: string;
  /** Text over the band. */
  label: string;
  /** Columns of the band, in order. */
  columns: TxHeatmapColumn[];
}

/** One cell of `tx-heatmap`, colored by a tone or by its value on the scale. */
export interface TxHeatmapCell {
  /** Color of the cell; without it a cell with a `value` takes the scale color. */
  tone?: TxHeatmapTone;
  /** Number placed on the color scale; `null` leaves the cell empty. */
  value?: number | null;
  /** Text of the tooltip. */
  tooltip?: string;
  /** Accessible name of the cell; the tooltip is used by default. */
  ariaLabel?: string;
  /** Makes the cell a button that emits `cellClick`. */
  interactive?: boolean;
  /** Draws nothing, for a slot outside the data. */
  hidden?: boolean;
  /** Any data you want back in `cellClick`. */
  data?: unknown;
}

/** One row of `tx-heatmap`: a header and a cell per column. */
export interface TxHeatmapRow {
  /** Unique key of the row. */
  key: string;
  /** Text of the row header; the key by default. */
  label?: string;
  /** Cells in the order of the columns of all groups; `null` is an empty slot. */
  cells: (TxHeatmapCell | null)[];
  /** Any data you want back in the row templates and `cellClick`. */
  data?: unknown;
}

/** One entry of the legend under the heatmap. */
export interface TxHeatmapLegendItem {
  /** Text of the entry. */
  label: string;
  /** Tone of the sample cell. */
  tone?: TxHeatmapTone;
  /** Value of the sample cell, colored on the scale. */
  value?: number;
}

/** Texts of the heatmap that are not data, for translation. */
export interface TxHeatmapLabels {
  /** Text of the corner cell over the row headers. */
  rowHeader: string;
  /** Text of the header over the value column. */
  valueHeader: string;
  /** Text of the legend entry for empty cells. */
  empty: string;
  /** Name of the scroll region for screen readers. */
  region: string;
}

/** Payload of `cellClick`: the clicked cell, its row and its column. */
export interface TxHeatmapCellClick {
  /** Row of the cell. */
  row: TxHeatmapRow;
  /** The clicked cell. */
  cell: TxHeatmapCell;
  /** Key of the column of the cell. */
  columnKey: string;
}

/** Context of the `txHeatmapRowHeader` and `txHeatmapRowValue` templates. */
export interface TxHeatmapRowContext {
  /** The row; what `let-row` binds to. */
  $implicit: TxHeatmapRow;
  /** The row. */
  row: TxHeatmapRow;
}

/** A cell of a row placed in its column. */
export interface TxHeatmapCellSlot {
  /** Key of the column. */
  columnKey: string;
  /** The cell; `null` for an empty slot. */
  cell: TxHeatmapCell | null;
}

/** The cells of one row that fall in one column band. */
export interface TxHeatmapRowGroup {
  /** Key of the column band. */
  key: string;
  /** Cells of the row in that band, one per column. */
  slots: TxHeatmapCellSlot[];
}

/** Color scale of cells that have a `value`. */
export interface TxHeatmapScale {
  /** Value drawn as empty; the start of the scale. */
  min: number;
  /** Value with the full color. */
  max: number;
  /** Number of color steps between them. */
  steps: number;
}

/** A value of one day for `heatmapCalendar`. */
export interface TxHeatmapCalendarValue {
  /** The day, as a `Date` or an ISO string. */
  date: string | Date;
  /** Number put on the color scale. */
  value: number;
  /** Text of the tooltip; the date and the value by default. */
  tooltip?: string;
  /** Any data you want back in `cellClick`; the ISO date by default. */
  data?: unknown;
}

/** Options of `heatmapCalendar`: the period and how to format and open it. */
export interface TxHeatmapCalendarOptions {
  /** First day of the period. */
  from: string | Date;
  /** Last day of the period. */
  to: string | Date;
  /** Locale of month, weekday and date names (default `en-US`). */
  intl?: string;
  /** First row of the grid, from 0 (Sunday) to 6 (Saturday); default 1 (Monday). */
  firstDayOfWeek?: number;
  /** Makes the day cells buttons that emit `cellClick`. */
  interactive?: boolean;
  /** Formats a value in the tooltip; the locale number format by default. */
  format?: (value: number) => string;
}

/** A calendar heatmap: the `groups` and `rows` to give to `tx-heatmap`. */
export interface TxHeatmapCalendar {
  /** Months as column bands, each with a column per week. */
  groups: TxHeatmapColumnGroup[];
  /** Seven rows, one per weekday. */
  rows: TxHeatmapRow[];
}

/** Parts of `tx-heatmap` that `pt` can style. */
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
