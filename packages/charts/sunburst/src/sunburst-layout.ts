import { TX_FULL_CIRCLE, seriesColor } from '@tectra-ng/charts/core';
import { TxSunburstArc, TxSunburstItem } from './sunburst-chart.types';

/** Value of an item: its own value, or the sum of its children when it has none. */
export function sunburstValue(item: TxSunburstItem): number {
  const own = item.value !== null && item.value !== undefined && Number.isFinite(item.value) ? Math.max(0, item.value) : null;
  const children = (item.children ?? []).reduce((sum, child) => sum + sunburstValue(child), 0);
  return own ?? children;
}

/** Slices shown after zooming into an index path, and the items along that path. */
export function sunburstFocus(roots: readonly TxSunburstItem[], path: readonly number[]): { items: readonly TxSunburstItem[]; trail: TxSunburstItem[] } {
  let items = roots;
  const trail: TxSunburstItem[] = [];
  for (const index of path) {
    const item = items[index];
    if (!item) break;
    trail.push(item);
    items = item.children ?? [];
  }
  return { items, trail };
}

/** Settings of `sunburstArcs`. */
export interface TxSunburstOptions {
  /** Number of rings drawn. */
  levels: number;
  /** Outer radius, in px. */
  radius: number;
  /** Size of the empty centre as a share of the radius, 0 to 0.9. */
  hole: number;
  /** Index path of the slice zoomed into; empty shows the top level. */
  focus: readonly number[];
}

/** Lays out the visible rings of a sunburst as arcs; slices without a positive value are skipped. */
export function sunburstArcs(roots: readonly TxSunburstItem[], options: TxSunburstOptions): TxSunburstArc[] {
  const { items, trail } = sunburstFocus(roots, options.focus);
  const levels = Math.max(1, Math.floor(options.levels));
  const inner = options.radius * Math.min(0.9, Math.max(0, options.hole));
  const ring = (options.radius - inner) / levels;
  const sum = items.reduce((acc, item) => acc + sunburstValue(item), 0);
  const focused = trail[trail.length - 1];
  const total = focused ? Math.max(sunburstValue(focused), sum) : sum;
  const arcs: TxSunburstArc[] = [];
  const topIndex = options.focus[0];
  const inherited = trail.reduce<string | undefined>((color, item) => item.color ?? color, undefined);

  const walk = (list: readonly TxSunburstItem[], path: number[], start: number, span: number, depth: number, parentValue: number, color: string | undefined) => {
    let cursor = start;
    list.forEach((item, index) => {
      const value = sunburstValue(item);
      if (value <= 0) return;
      const sweep = parentValue > 0 ? (value / parentValue) * span : 0;
      const itemPath = [...path, index];
      const base = item.color ?? color ?? seriesColor(undefined, topIndex ?? itemPath[0]);
      arcs.push({
        key: itemPath.join('.'),
        path: itemPath,
        item,
        label: item.label,
        value,
        depth,
        start: cursor,
        end: cursor + sweep,
        inner: inner + (depth - 1) * ring,
        outer: inner + depth * ring,
        base,
        share: total ? value / total : 0,
        parentShare: parentValue ? value / parentValue : 0,
        hasChildren: !!item.children?.some((child) => sunburstValue(child) > 0),
      });
      if (depth < levels && item.children?.length) {
        walk(item.children, itemPath, cursor, sweep, depth + 1, Math.max(value, (item.children ?? []).reduce((sum, child) => sum + sunburstValue(child), 0)), item.color ?? color ?? base);
      }
      cursor += sweep;
    });
  };
  walk(items, [...options.focus], 0, TX_FULL_CIRCLE, 1, total, inherited);
  return arcs;
}

/** The arc under a point, or `null` outside all arcs. */
export function sunburstArcAt(arcs: readonly TxSunburstArc[], x: number, y: number, cx: number, cy: number): TxSunburstArc | null {
  const distance = Math.hypot(x - cx, y - cy);
  let angle = Math.atan2(x - cx, -(y - cy));
  if (angle < 0) angle += TX_FULL_CIRCLE;
  return arcs.find((arc) => distance >= arc.inner && distance <= arc.outer && angle >= arc.start && angle < arc.end) ?? null;
}
