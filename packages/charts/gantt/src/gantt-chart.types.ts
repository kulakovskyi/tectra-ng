export type TxGanttDate = string | number | Date;

export interface TxGanttTask {
  id: string;
  label: string;
  start: TxGanttDate;
  end?: TxGanttDate | null;
  group?: string;
  progress?: number | null;
  milestone?: boolean;
  color?: string;
}

export type TxGanttZoom = 'day' | 'week' | 'month' | 'quarter';

export type TxGanttLayout = 'tasks' | 'timeline';

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

export interface TxGanttTick {
  key: string;
  label: string;
  x: number;
  width: number;
  weekend?: boolean;
}

export interface TxGanttSpan {
  task: TxGanttTask;
  index: number;
  start: number;
  end: number;
  x: number;
  width: number;
  color: string;
}

export interface TxGanttRow {
  key: string;
  kind: 'group' | 'task';
  label: string;
  group: string | null;
  spans: TxGanttSpan[];
  summary: { x: number; width: number } | null;
  collapsed: boolean;
  count: number;
}

export interface TxGanttTaskEvent {
  task: TxGanttTask;
  start: Date;
  end: Date;
}

export interface TxGanttGroupToggle {
  group: string;
  collapsed: boolean;
}
