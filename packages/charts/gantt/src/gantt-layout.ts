import { dateFormat, seriesColor, toTime } from '@tectra-ng/charts/core';
import { TxGanttDate, TxGanttFold, TxGanttLayout, TxGanttRow, TxGanttSpan, TxGanttTask, TxGanttTick, TxGanttZoom } from './gantt-chart.types';

/** Length of a day in ms. */
export const TX_GANTT_DAY = 86_400_000;

/** Width of one day in px on each zoom level. */
export const TX_GANTT_DAY_WIDTH: Record<TxGanttZoom, number> = { day: 40, week: 16, month: 5, quarter: 2 };

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Midnight of the local day that contains the time, in ms. */
export function startOfDay(time: number): number {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function addDays(time: number, days: number): number {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days).getTime();
}

function daysBetween(from: number, to: number): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / TX_GANTT_DAY) + ((to - startOfDay(to)) - (from - startOfDay(from))) / TX_GANTT_DAY;
}

/**
 * Converts a Gantt date to ms; `null` when it is empty or invalid. With `inclusiveEnd` a date-only string points to the end of that day.
 */
export function ganttTime(value: TxGanttDate | null | undefined, inclusiveEnd = false): number | null {
  const time = toTime(value ?? null);
  if (time === null) return null;
  return inclusiveEnd && typeof value === 'string' && DATE_ONLY.test(value) ? addDays(time, 1) : time;
}

/**
 * Start and end of a task in ms; a milestone has equal ends and a task without `end` lasts one day. `null` when the start is invalid.
 */
export function ganttTaskRange(task: TxGanttTask): [number, number] | null {
  const start = ganttTime(task.start);
  if (start === null) return null;
  if (task.milestone) return [start, start];
  const end = ganttTime(task.end ?? null, true) ?? addDays(startOfDay(start), 1);
  return [start, Math.max(start, end)];
}

/**
 * Range of the scale in ms: from `from` or the earliest task to `to` or the latest one, widened by `padding` days on both sides.
 */
export function ganttRange(tasks: readonly TxGanttTask[], padding: number, from?: TxGanttDate | null, to?: TxGanttDate | null): [number, number] {
  const ranges = tasks.map(ganttTaskRange).filter((range): range is [number, number] => range !== null);
  const min = ganttTime(from ?? null) ?? (ranges.length ? Math.min(...ranges.map((range) => range[0])) : startOfDay(Date.now()));
  const max = ganttTime(to ?? null, true) ?? (ranges.length ? Math.max(...ranges.map((range) => range[1])) : addDays(min, 30));
  const lastDay = startOfDay(max) === max ? max : addDays(startOfDay(max), 1);
  return [addDays(startOfDay(min), -padding), addDays(lastDay, padding)];
}

/** Horizontal position in px of a time on the scale that starts at `rangeStart`. */
export function ganttX(time: number, rangeStart: number, dayWidth: number): number {
  return daysBetween(rangeStart, time) * dayWidth;
}

/**
 * Cells of the two header lines of the scale for a zoom level: months over days or weeks, years over months or quarters.
 */
export function ganttTicks(range: [number, number], zoom: TxGanttZoom, intl: string): { top: TxGanttTick[]; bottom: TxGanttTick[] } {
  const width = TX_GANTT_DAY_WIDTH[zoom];
  const [start, end] = range;
  const cell = (from: number, to: number, label: string, key: string, weekend?: boolean): TxGanttTick => ({
    key,
    label,
    x: ganttX(from, start, width),
    width: ganttX(Math.min(to, end), start, width) - ganttX(from, start, width),
    ...(weekend === undefined ? {} : { weekend }),
  });
  const months = (format: Intl.DateTimeFormat) => {
    const cells: TxGanttTick[] = [];
    let cursor = new Date(new Date(start).getFullYear(), new Date(start).getMonth(), 1).getTime();
    while (cursor < end) {
      const date = new Date(cursor);
      const next = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
      cells.push(cell(Math.max(cursor, start), next, format.format(date), `m${cursor}`));
      cursor = next;
    }
    return cells;
  };
  const years = () => {
    const cells: TxGanttTick[] = [];
    let cursor = new Date(new Date(start).getFullYear(), 0, 1).getTime();
    while (cursor < end) {
      const next = new Date(new Date(cursor).getFullYear() + 1, 0, 1).getTime();
      cells.push(cell(Math.max(cursor, start), next, String(new Date(cursor).getFullYear()), `y${cursor}`));
      cursor = next;
    }
    return cells;
  };
  if (zoom === 'day') {
    const day = dateFormat(intl, { day: 'numeric' });
    const bottom: TxGanttTick[] = [];
    for (let cursor = start; cursor < end; cursor = addDays(cursor, 1)) {
      const weekday = new Date(cursor).getDay();
      bottom.push(cell(cursor, addDays(cursor, 1), day.format(cursor), `d${cursor}`, weekday === 0 || weekday === 6));
    }
    return { top: months(dateFormat(intl, { month: 'long', year: 'numeric' })), bottom };
  }
  if (zoom === 'week') {
    const day = dateFormat(intl, { day: 'numeric', month: 'short' });
    const bottom: TxGanttTick[] = [];
    let cursor = start;
    const first = new Date(start).getDay();
    const toMonday = (8 - (first || 7)) % 7;
    if (toMonday) {
      bottom.push(cell(cursor, addDays(cursor, toMonday), '', `w${cursor}`));
      cursor = addDays(cursor, toMonday);
    }
    for (; cursor < end; cursor = addDays(cursor, 7)) bottom.push(cell(cursor, addDays(cursor, 7), day.format(cursor), `w${cursor}`));
    return { top: months(dateFormat(intl, { month: 'long', year: 'numeric' })), bottom };
  }
  if (zoom === 'month') {
    return { top: years(), bottom: months(dateFormat(intl, { month: 'short' })) };
  }
  const bottom: TxGanttTick[] = [];
  let cursor = new Date(new Date(start).getFullYear(), Math.floor(new Date(start).getMonth() / 3) * 3, 1).getTime();
  while (cursor < end) {
    const date = new Date(cursor);
    const next = new Date(date.getFullYear(), date.getMonth() + 3, 1).getTime();
    bottom.push(cell(Math.max(cursor, start), next, `Q${Math.floor(date.getMonth() / 3) + 1}`, `q${cursor}`));
    cursor = next;
  }
  return { top: years(), bottom };
}

/**
 * Builds the rows for a layout: a row per task and a header per group (`tasks`), or a lane per group (`timeline`).
 */
export function ganttRows(
  tasks: readonly TxGanttTask[],
  layout: TxGanttLayout,
  collapsed: ReadonlySet<string>,
  rangeStart: number,
  dayWidth: number,
  minWidth: number,
): TxGanttRow[] {
  const groups: string[] = [];
  tasks.forEach((task) => {
    if (task.group && !groups.includes(task.group)) groups.push(task.group);
  });
  const spanOf = (task: TxGanttTask, index: number): TxGanttSpan | null => {
    const range = ganttTaskRange(task);
    if (!range) return null;
    const x = ganttX(range[0], rangeStart, dayWidth);
    const width = task.milestone ? 0 : Math.max(minWidth, ganttX(range[1], rangeStart, dayWidth) - x);
    const groupIndex = task.group ? groups.indexOf(task.group) : 0;
    return { task, index, start: range[0], end: range[1], x, width, color: seriesColor(task.color, Math.max(0, groupIndex)) };
  };
  const spans = tasks.map(spanOf);
  const summary = (items: TxGanttSpan[]) => {
    if (!items.length) return null;
    const x = Math.min(...items.map((item) => item.x));
    return { x, width: Math.max(...items.map((item) => item.x + item.width)) - x };
  };
  const rows: TxGanttRow[] = [];
  const ungrouped = tasks.flatMap((task, index) => (!task.group && spans[index] ? [spans[index] as TxGanttSpan] : []));
  if (layout === 'timeline') {
    for (const group of groups) {
      const items = tasks.flatMap((task, index) => (task.group === group && spans[index] ? [spans[index] as TxGanttSpan] : []));
      rows.push({ key: `lane:${group}`, kind: 'task', label: group, group, spans: items, summary: null, collapsed: false, count: items.length });
    }
    ungrouped.forEach((span) => rows.push({ key: `task:${span.task.id}`, kind: 'task', label: span.task.label, group: null, spans: [span], summary: null, collapsed: false, count: 1 }));
    return rows;
  }
  ungrouped.forEach((span) => rows.push({ key: `task:${span.task.id}`, kind: 'task', label: span.task.label, group: null, spans: [span], summary: null, collapsed: false, count: 1 }));
  for (const group of groups) {
    const items = tasks.flatMap((task, index) => (task.group === group && spans[index] ? [spans[index] as TxGanttSpan] : []));
    const closed = collapsed.has(group);
    rows.push({ key: `group:${group}`, kind: 'group', label: group, group, spans: [], summary: summary(items), collapsed: closed, count: items.length });
    items.forEach((span) => rows.push({ key: `task:${span.task.id}`, kind: 'task', label: span.task.label, group, spans: [span], summary: null, collapsed: closed, count: 1 }));
  }
  return rows;
}

/** Gathers rows into folds, each a group header with the rows under it. */
export function ganttFolds(rows: readonly TxGanttRow[]): TxGanttFold[] {
  const folds: TxGanttFold[] = [];
  for (const row of rows) {
    const last = folds[folds.length - 1];
    if (row.kind === 'group') folds.push({ key: row.key, head: row, rows: [], collapsed: row.collapsed });
    else if (last && (last.head ? last.head.group === row.group : true)) last.rows.push(row);
    else folds.push({ key: `rows:${row.key}`, head: null, rows: [row], collapsed: false });
  }
  return folds;
}

/** Number of days between two times, never negative. */
export function ganttDays(start: number, end: number): number {
  return Math.max(0, Math.round(daysBetween(start, end)));
}
