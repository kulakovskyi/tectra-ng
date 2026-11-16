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
  /** Tasks this one waits for: ids (finish-to-start) or `{ id, type }`. Unknown ids, self links and links that close a cycle are left out. */
  dependsOn?: readonly (string | TxGanttDependency)[] | null;
}

/**
 * How a task waits for its predecessor: `finish-to-start` (default) — starts after it ends, `start-to-start` — starts after it
 * starts, `finish-to-finish` — ends after it ends, `start-to-finish` — ends after it starts.
 */
export type TxGanttDependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

/** A predecessor of a task with the kind of link. */
export interface TxGanttDependency {
  /** Id of the predecessor task. */
  id: string;
  /** Kind of link; `finish-to-start` by default. */
  type?: TxGanttDependencyType;
}

/** A checked dependency: both tasks exist, no self link, no duplicate and no cycle. */
export interface TxGanttLink {
  /** Id of the predecessor. */
  from: string;
  /** Id of the task that waits for it. */
  to: string;
  /** Kind of link. */
  type: TxGanttDependencyType;
}

/** A point of a dependency route: x in px, y in rows from the top of the body. */
export type TxGanttPoint = [x: number, y: number];

/** A box a dependency route keeps out of: x in px, y in rows. */
export interface TxGanttBox {
  /** Left edge in px. */
  x1: number;
  /** Right edge in px. */
  x2: number;
  /** Top edge in rows. */
  y1: number;
  /** Bottom edge in rows. */
  y2: number;
}

/** One end of a dependency route: a point on the left (`start`) or right (`finish`) edge of a bar. */
export interface TxGanttLinkEnd {
  /** Horizontal position in px. */
  x: number;
  /** Vertical position in rows. */
  y: number;
  /** Edge of the bar the route leaves or enters. */
  side: 'start' | 'finish';
}

/** A dependency arrow ready to draw; x in px, y in rows. */
export interface TxGanttLinkPath {
  /** Stable key of the arrow. */
  key: string;
  /** Indexes of the links in the list of `ganttLinks` that the arrow stands for; several when they meet on a folded group. */
  links: number[];
  /** SVG path of the line. */
  path: string;
  /** SVG path of the arrowhead. */
  head: string;
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
  | 'dependency'
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
  /** Sub-row of the bar inside its row, from 0; overlapping tasks of a timeline lane get their own sub-rows. */
  lane: number;
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
  /** Number of sub-rows the row needs for its overlapping bars; 1 for a single bar. */
  lanes: number;
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
