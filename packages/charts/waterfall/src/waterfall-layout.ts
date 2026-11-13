import { TxWaterfallItem, TxWaterfallStep } from './waterfall-chart.types';

/**
 * Turns items into steps with a running total; a total item shows the sum so far and missing values count as zero.
 */
export function waterfallSteps(items: readonly TxWaterfallItem[]): TxWaterfallStep[] {
  let running = 0;
  return items.map((item, index) => {
    if (item.total) {
      return { index, label: item.label, kind: 'total', change: running, from: 0, to: running, color: item.color ?? null };
    }
    const change = item.value !== null && item.value !== undefined && Number.isFinite(item.value) ? item.value : 0;
    const from = running;
    running += change;
    return { index, label: item.label, kind: change < 0 ? 'down' : 'up', change, from, to: running, color: item.color ?? null };
  });
}

/** Smallest and largest running total, always including 0. */
export function waterfallExtent(steps: readonly TxWaterfallStep[]): [number, number] {
  let min = 0;
  let max = 0;
  for (const step of steps) {
    min = Math.min(min, step.from, step.to);
    max = Math.max(max, step.from, step.to);
  }
  return [min, max];
}
