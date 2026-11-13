/** A date of `tx-gantt-chart`: a `Date`, a timestamp in ms or an ISO string. */
export type TxGanttDate = string | number | Date;

/** One task of `tx-gantt-chart`: a bar between two dates, or a milestone. */
export interface TxGanttTask {
  /** Unique id of the task. */
  id: string;
  /** Name of the task, shown beside or inside the bar. */
  label: string;
  /** First day of the task. */
  start: TxGanttDate;
  /** Last day of the task; a date-only string includes that day. Without it the task lasts one day. */
  end?: TxGanttDate | null;
  /** Group the task belongs to; groups fold in the `tasks` layout and become lanes in `timeline`. */
  group?: string;
  /** Done part of the task in percent (0 to 100). */
  progress?: number | null;
  /** Draws a diamond at `start` instead of a bar. */
  milestone?: boolean;
  /** Color of the bar; by default the color of its group. */
  color?: string;
}

/** Width of a day on the scale: `day`, `week`, `month` or `quarter`. */
export type TxGanttZoom = 'day' | 'week' | 'month' | 'quarter';

/** `tasks` gives a row per task under its group; `timeline` gives a lane per group with all its tasks. */
export type TxGanttLayout = 'tasks' | 'timeline';

/** Parts of `tx-gantt-chart` that `pt` can style. */
export type TxGanttPart =
  | 'root'
  | 'toolbar'
  | 'scroll'
  | 'head'
  | 'corner'
  | 'scale'
  | 'row'
  | 'group'
  | 'label'
  | 'lane'
  | 'bar'
  | 'milestone'
  | 'today'
  | 'empty';

/** A cell of the date scale in the header. */
export interface TxGanttTick {
  /** Stable key of the cell. */
  key: string;
  /** Text of the cell, such as a day number, a month or a quarter. */
  label: string;
  /** Left edge of the cell in px. */
  x: number;
  /** Width of the cell in px. */
  width: number;
  /** `true` for a Saturday or Sunday cell on the day scale. */
  weekend?: boolean;
}

/** A task placed on the scale, ready to draw. */
export interface TxGanttSpan {
  /** The task as given in `tasks`. */
  task: TxGanttTask;
  /** Index of the task in `tasks`. */
  index: number;
  /** Start time in ms. */
  start: number;
  /** End time in ms (exclusive). */
  end: number;
  /** Left edge of the bar in px. */
  x: number;
  /** Width of the bar in px; 0 for a milestone. */
  width: number;
  /** Color of the bar. */
  color: string;
}

/** A row of `tx-gantt-chart`: a group header, a task or a lane. */
export interface TxGanttRow {
  /** Stable key of the row. */
  key: string;
  /** `group` for a group header, `task` for a task or a lane. */
  kind: 'group' | 'task';
  /** Text in the label column. */
  label: string;
  /** Group of the row; `null` for a task without one. */
  group: string | null;
  /** Bars drawn in the row; a lane has several. */
  spans: TxGanttSpan[];
  /** Bar that spans all tasks of a group header; `null` for other rows. */
  summary: { x: number; width: number } | null;
  /** `true` when the group of the row is folded. */
  collapsed: boolean;
  /** How many tasks the row holds. */
  count: number;
}

/** A group header with the rows it folds, or a run of rows without a group. */
export interface TxGanttFold {
  /** Stable key of the fold. */
  key: string;
  /** Group header row; `null` for rows without a group. */
  head: TxGanttRow | null;
  /** Task rows under the header. */
  rows: TxGanttRow[];
  /** `true` when the rows are hidden. */
  collapsed: boolean;
}

/** Payload of `taskClick`: the clicked task and its dates. */
export interface TxGanttTaskEvent {
  /** The task as given in `tasks`. */
  task: TxGanttTask;
  /** Start of the task. */
  start: Date;
  /** End of the task, exclusive. */
  end: Date;
}

/** Payload of `groupToggle`: a group folded or unfolded. */
export interface TxGanttGroupToggle {
  /** Name of the group. */
  group: string;
  /** `true` when the group is now folded. */
  collapsed: boolean;
}
