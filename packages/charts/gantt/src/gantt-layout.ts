import { dateFormat, seriesColor, textWidth, toTime } from '@tectra-ng/charts/core';
import {
  TxGanttBox,
  TxGanttDate,
  TxGanttDependencyType,
  TxGanttFold,
  TxGanttLayout,
  TxGanttLink,
  TxGanttLinkEnd,
  TxGanttLinkPath,
  TxGanttPoint,
  TxGanttRow,
  TxGanttSpan,
  TxGanttTask,
  TxGanttTick,
  TxGanttZoom,
} from './gantt-chart.types';

/** Length of a day in ms. */
export const TX_GANTT_DAY = 86_400_000;

/** Width of one day in px on each zoom level. */
export const TX_GANTT_DAY_WIDTH: Record<TxGanttZoom, number> = { day: 40, week: 16, month: 5, quarter: 2 };

/** Length in px of the stub a dependency arrow draws out of a bar edge; a name drawn beside that edge moves this much aside. */
export const TX_GANTT_LINK_STUB = 8;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const LABEL_ROOM = 8;
const MILESTONE_HALF = 7;
const MILESTONE_EDGE = 8;
const BAR_HALF = 0.3;
const LABEL_HALF = 0.25;
const LABEL_GAP = 6;
const LINK_STUB_IN = 12;
const LINK_STUB_MIN = 10;
const LINK_CLEAR = 4;
const LINK_RADIUS_X = 4;
const LINK_RADIUS_Y = 0.12;
const LINK_HEAD = 6;
const LINK_HEAD_HALF = 0.11;
const LINK_TYPES: ReadonlySet<string> = new Set<TxGanttDependencyType>(['finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish']);
const EPSILON = 1e-6;

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

/** First day after the end of the header cell that contains `end - 1 ms`: the next Monday, month or quarter for those zooms. */
export function ganttCellEnd(end: number, zoom: TxGanttZoom): number {
  const date = new Date(end);
  const midnight = startOfDay(end) === end;
  if (zoom === 'day') return midnight ? end : addDays(startOfDay(end), 1);
  if (zoom === 'week') {
    const day = midnight ? end : addDays(startOfDay(end), 1);
    return addDays(day, (8 - (new Date(day).getDay() || 7)) % 7);
  }
  const months = zoom === 'month' ? 1 : 3;
  const first = new Date(date.getFullYear(), Math.floor(date.getMonth() / months) * months, 1).getTime();
  return first === end ? end : new Date(date.getFullYear(), Math.floor(date.getMonth() / months) * months + months, 1).getTime();
}

/**
 * Widens a range so the scale is at least `minWidth` px wide at the zoom level and ends on the edge of a whole header cell.
 */
export function ganttFitRange(range: [number, number], zoom: TxGanttZoom, minWidth: number): [number, number] {
  const days = Math.ceil(Math.max(0, minWidth) / TX_GANTT_DAY_WIDTH[zoom]);
  return [range[0], ganttCellEnd(Math.max(range[1], addDays(range[0], days)), zoom)];
}

/** Horizontal position in px of a time on the scale that starts at `rangeStart`. */
export function ganttX(time: number, rangeStart: number, dayWidth: number): number {
  return daysBetween(rangeStart, time) * dayWidth;
}

/**
 * Cells of the two header lines of the scale for a zoom level: months over days or weeks, years over months or quarters.
 */
export function ganttTicks(range: [number, number], zoom: TxGanttZoom, intl: string, fontSize = 12): { top: TxGanttTick[]; bottom: TxGanttTick[] } {
  const width = TX_GANTT_DAY_WIDTH[zoom];
  const [start, end] = range;
  const cell = (from: number, to: number, label: string, key: string, weekend?: boolean): TxGanttTick => {
    const size = ganttX(Math.min(to, end), start, width) - ganttX(from, start, width);
    return {
      key,
      label: textWidth(label, fontSize) + LABEL_ROOM <= size ? label : '',
      x: ganttX(from, start, width),
      width: size,
      ...(weekend === undefined ? {} : { weekend }),
    };
  };
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
 * Puts overlapping bars on separate sub-rows: each bar takes the first sub-row whose last bar ends at or before its start.
 * Bars keep their order; a milestone takes the width of its diamond.
 */
export function ganttPack(spans: readonly TxGanttSpan[]): { spans: TxGanttSpan[]; lanes: number } {
  const from = (span: TxGanttSpan) => (span.task.milestone ? span.x - MILESTONE_HALF : span.x);
  const to = (span: TxGanttSpan) => (span.task.milestone ? span.x + MILESTONE_HALF : span.x + span.width);
  const order = spans.map((_, index) => index).sort((a, b) => from(spans[a]) - from(spans[b]) || spans[a].index - spans[b].index);
  const ends: number[] = [];
  const lanes: number[] = [];
  for (const index of order) {
    const span = spans[index];
    const free = ends.findIndex((end) => end <= from(span) + 0.5);
    const lane = free < 0 ? ends.length : free;
    ends[lane] = to(span);
    lanes[index] = lane;
  }
  return { spans: spans.map((span, index) => ({ ...span, lane: lanes[index] })), lanes: Math.max(1, ends.length) };
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
    return { task, index, start: range[0], end: range[1], x, width, color: seriesColor(task.color, Math.max(0, groupIndex)), lane: 0 };
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
      const packed = ganttPack(items);
      rows.push({ key: `lane:${group}`, kind: 'task', label: group, group, spans: packed.spans, summary: null, collapsed: false, count: items.length, lanes: packed.lanes });
    }
    ungrouped.forEach((span) => rows.push({ key: `task:${span.task.id}`, kind: 'task', label: span.task.label, group: null, spans: [span], summary: null, collapsed: false, count: 1, lanes: 1 }));
    return rows;
  }
  ungrouped.forEach((span) => rows.push({ key: `task:${span.task.id}`, kind: 'task', label: span.task.label, group: null, spans: [span], summary: null, collapsed: false, count: 1, lanes: 1 }));
  for (const group of groups) {
    const items = tasks.flatMap((task, index) => (task.group === group && spans[index] ? [spans[index] as TxGanttSpan] : []));
    const closed = collapsed.has(group);
    rows.push({ key: `group:${group}`, kind: 'group', label: group, group, spans: [], summary: summary(items), collapsed: closed, count: items.length, lanes: 1 });
    items.forEach((span) => rows.push({ key: `task:${span.task.id}`, kind: 'task', label: span.task.label, group, spans: [span], summary: null, collapsed: closed, count: 1, lanes: 1 }));
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

/**
 * Checks the `dependsOn` lists of the tasks: drops unknown ids, self links, repeated pairs and every link that would close a cycle
 * (found depth-first in task order), so the result is always a graph without loops.
 */
export function ganttLinks(tasks: readonly TxGanttTask[]): TxGanttLink[] {
  const ids = new Set(tasks.map((task) => task.id));
  const pairs = new Set<string>();
  const links: TxGanttLink[] = [];
  for (const task of tasks) {
    for (const item of task.dependsOn ?? []) {
      const from = typeof item === 'string' ? item : item?.id;
      const given = typeof item === 'string' ? undefined : item?.type;
      if (!from || from === task.id || !ids.has(from)) continue;
      const pair = JSON.stringify([from, task.id]);
      if (pairs.has(pair)) continue;
      pairs.add(pair);
      links.push({ from, to: task.id, type: given && LINK_TYPES.has(given) ? given : 'finish-to-start' });
    }
  }
  const outgoing = new Map<string, number[]>();
  links.forEach((link, index) => outgoing.set(link.from, [...(outgoing.get(link.from) ?? []), index]));
  const state = new Map<string, 'open' | 'done'>();
  const dropped = new Set<number>();
  for (const task of tasks) {
    if (state.has(task.id)) continue;
    state.set(task.id, 'open');
    const stack = [{ id: task.id, next: 0 }];
    while (stack.length) {
      const top = stack[stack.length - 1];
      const edges = outgoing.get(top.id) ?? [];
      if (top.next >= edges.length) {
        state.set(top.id, 'done');
        stack.pop();
        continue;
      }
      const index = edges[top.next++];
      const target = links[index].to;
      const mark = state.get(target);
      if (mark === 'open') dropped.add(index);
      else if (!mark) {
        state.set(target, 'open');
        stack.push({ id: target, next: 0 });
      }
    }
  }
  return links.filter((_, index) => !dropped.has(index));
}

/**
 * The dependency chain of a task: every task it waits for and every task that waits for it, directly or through others,
 * with the indexes of the links between them.
 */
export function ganttChain(links: readonly TxGanttLink[], id: string): { tasks: Set<string>; links: Set<number> } {
  const tasks = new Set([id]);
  const used = new Set<number>();
  for (const forward of [true, false]) {
    const queue = [id];
    const seen = new Set([id]);
    for (let at = 0; at < queue.length; at++) {
      links.forEach((link, index) => {
        if ((forward ? link.from : link.to) !== queue[at]) return;
        const next = forward ? link.to : link.from;
        used.add(index);
        tasks.add(next);
        if (seen.has(next)) return;
        seen.add(next);
        queue.push(next);
      });
    }
  }
  return { tasks, links: used };
}

function crossings(points: readonly TxGanttPoint[], boxes: readonly TxGanttBox[]): number {
  let count = 0;
  for (let index = 1; index < points.length; index++) {
    const [ax, ay] = points[index - 1];
    const [bx, by] = points[index];
    const [x1, x2, y1, y2] = [Math.min(ax, bx), Math.max(ax, bx), Math.min(ay, by), Math.max(ay, by)];
    for (const box of boxes) {
      if (x1 < box.x2 && x2 > box.x1 && y1 < box.y2 && y2 > box.y1) count++;
    }
  }
  return count;
}

function simplify(points: readonly TxGanttPoint[]): TxGanttPoint[] {
  const same = (a: number, b: number) => Math.abs(a - b) < EPSILON;
  const distinct = points.filter((point, index) => index === 0 || !same(point[0], points[index - 1][0]) || !same(point[1], points[index - 1][1]));
  return distinct.filter((point, index) => {
    if (index === 0 || index === distinct.length - 1) return true;
    const [prev, next] = [distinct[index - 1], distinct[index + 1]];
    return !((same(prev[0], point[0]) && same(point[0], next[0])) || (same(prev[1], point[1]) && same(point[1], next[1])));
  });
}

/**
 * Orthogonal route of a dependency arrow from one bar edge to another: a short stub out of the source, a vertical run and a stub
 * into the target, which shrinks to fit a narrow gap. When the target edge lies behind the source the route goes around through
 * the gap between rows. Among
 * the possible routes the one that crosses the fewest `boxes` wins, then the one with fewer turns.
 */
export function ganttRoute(from: TxGanttLinkEnd, to: TxGanttLinkEnd, boxes: readonly TxGanttBox[] = []): TxGanttPoint[] {
  const out = from.side === 'finish' ? 1 : -1;
  const back = to.side === 'finish' ? 1 : -1;
  const a = from.x + out * TX_GANTT_LINK_STUB;
  const b = to.x + back * LINK_STUB_IN;
  const far = to.x + back * LINK_STUB_MIN;
  const lo = Math.max(out > 0 ? a : -Infinity, back > 0 ? far : -Infinity);
  const hi = Math.min(out < 0 ? a : Infinity, back < 0 ? far : Infinity);
  const direct = (v: number): TxGanttPoint[] => [[from.x, from.y], [v, from.y], [v, to.y], [to.x, to.y]];
  const around = (gap: number): TxGanttPoint[] => [[from.x, from.y], [a, from.y], [a, gap], [b, gap], [b, to.y], [to.x, to.y]];
  const routes: TxGanttPoint[][] = [];
  if (lo <= hi) {
    const clamp = (v: number) => Math.min(hi, Math.max(lo, v));
    const first = direct(clamp(a));
    const edges = boxes.filter((box) => crossings(first, [box])).flatMap((box) => [box.x1 - LINK_CLEAR, box.x2 + LINK_CLEAR]);
    for (const v of [clamp(a), clamp(b), ...edges.filter((edge) => edge >= lo && edge <= hi)]) routes.push(direct(v));
  }
  const step = to.y > from.y ? 0.5 : -0.5;
  const gaps = Math.abs(to.y - from.y) < EPSILON ? [from.y + 0.5, from.y - 0.5] : [from.y + step, to.y - step];
  for (const gap of gaps) routes.push(around(gap));
  let best: TxGanttPoint[] = [];
  let score = Infinity;
  for (const route of routes) {
    const points = simplify(route);
    const value = crossings(points, boxes) * 100 + points.length;
    if (value < score) {
      score = value;
      best = points;
    }
  }
  return best;
}

const num = (value: number) => String(Math.round(value * 1000) / 1000);

/** SVG path of a route with its corners rounded by `rx` px across and `ry` rows down. */
export function ganttLinkPath(points: readonly TxGanttPoint[], rx = LINK_RADIUS_X, ry = LINK_RADIUS_Y): string {
  const clean = simplify(points);
  if (!clean.length) return '';
  const toward = (corner: TxGanttPoint, other: TxGanttPoint): TxGanttPoint =>
    Math.abs(corner[1] - other[1]) < EPSILON
      ? [corner[0] + Math.sign(other[0] - corner[0]) * Math.min(rx, Math.abs(other[0] - corner[0]) / 2), corner[1]]
      : [corner[0], corner[1] + Math.sign(other[1] - corner[1]) * Math.min(ry, Math.abs(other[1] - corner[1]) / 2)];
  const parts = [`M${num(clean[0][0])} ${num(clean[0][1])}`];
  for (let index = 1; index < clean.length - 1; index++) {
    const corner = clean[index];
    const before = toward(corner, clean[index - 1]);
    const after = toward(corner, clean[index + 1]);
    parts.push(`L${num(before[0])} ${num(before[1])}`, `Q${num(corner[0])} ${num(corner[1])} ${num(after[0])} ${num(after[1])}`);
  }
  const last = clean[clean.length - 1];
  if (clean.length > 1) parts.push(`L${num(last[0])} ${num(last[1])}`);
  return parts.join(' ');
}

/** SVG path of the arrowhead at the end of a route, pointing along its last segment. */
export function ganttArrowHead(points: readonly TxGanttPoint[], length = LINK_HEAD, half = LINK_HEAD_HALF): string {
  const clean = simplify(points);
  if (clean.length < 2) return '';
  const [x, y] = clean[clean.length - 1];
  const [px] = clean[clean.length - 2];
  const base = x - (Math.sign(x - px) || 1) * length;
  return `M${num(x)} ${num(y)} L${num(base)} ${num(y - half)} L${num(base)} ${num(y + half)} Z`;
}

/** Ids of the tasks with a dependency arrow on the right (`finish`) edge; their names beside the bar move aside for it. */
export function ganttFinishLinked(links: readonly TxGanttLink[]): Set<string> {
  return new Set(links.flatMap((link) => [...(link.type.startsWith('finish') ? [link.from] : []), ...(link.type.endsWith('finish') ? [link.to] : [])]));
}

/**
 * Dependency arrows for the folds as drawn: y in rows from the top of the body, folded rows take no height. A task of a folded
 * group hands its arrows to the group summary bar; arrows inside one folded group are left out and arrows that meet on the same
 * ends are drawn once. Routes keep out of other bars and, with `labelWidth`, out of the names drawn beside the bars. `height` is
 * the body height in rows.
 */
export function ganttLinkPaths(
  links: readonly TxGanttLink[],
  folds: readonly TxGanttFold[],
  labelWidth?: (task: TxGanttTask) => number,
): { paths: TxGanttLinkPath[]; height: number } {
  const shifted = ganttFinishLinked(links);
  interface Anchor {
    key: string;
    x1: number;
    x2: number;
    y: number;
  }
  const anchors = new Map<string, Anchor>();
  const boxes: (TxGanttBox & { key: string })[] = [];
  let y = 0;
  for (const fold of folds) {
    const summary = fold.head?.summary;
    const group: Anchor | null = fold.head && summary ? { key: fold.head.key, x1: summary.x, x2: summary.x + summary.width, y: y + 0.5 } : null;
    if (fold.head) y += 1;
    for (const row of fold.rows) {
      for (const span of row.spans) {
        if (fold.collapsed && group) {
          anchors.set(span.task.id, group);
          continue;
        }
        const half = span.task.milestone ? MILESTONE_EDGE : 0;
        const anchor = { key: `task:${span.task.id}`, x1: span.x - half, x2: span.x + span.width + half, y: y + span.lane + 0.5 };
        anchors.set(span.task.id, anchor);
        boxes.push({ key: anchor.key, x1: anchor.x1, x2: anchor.x2, y1: anchor.y - BAR_HALF, y2: anchor.y + BAR_HALF });
        const label = labelWidth?.(span.task) ?? 0;
        const left = anchor.x2 + LABEL_GAP + (shifted.has(span.task.id) ? TX_GANTT_LINK_STUB : 0);
        if (label > 0) boxes.push({ key: `label:${span.task.id}`, x1: left, x2: left + label, y1: anchor.y - LABEL_HALF, y2: anchor.y + LABEL_HALF });
      }
      if (!fold.collapsed) y += row.lanes;
    }
  }
  const paths = new Map<string, TxGanttLinkPath>();
  links.forEach((link, index) => {
    const from = anchors.get(link.from);
    const to = anchors.get(link.to);
    if (!from || !to || from.key === to.key) return;
    const key = JSON.stringify([from.key, to.key, link.type]);
    const known = paths.get(key);
    if (known) {
      known.links.push(index);
      return;
    }
    const fromSide = link.type.startsWith('start') ? 'start' : 'finish';
    const toSide = link.type.endsWith('start') ? 'start' : 'finish';
    const points = ganttRoute(
      { x: fromSide === 'start' ? from.x1 : from.x2, y: from.y, side: fromSide },
      { x: toSide === 'start' ? to.x1 : to.x2, y: to.y, side: toSide },
      boxes.filter((box) => box.key !== from.key && box.key !== to.key),
    );
    paths.set(key, { key, links: [index], path: ganttLinkPath(points), head: ganttArrowHead(points) });
  });
  return { paths: [...paths.values()], height: y };
}
