import { TxWaterfallItem, TxWaterfallStep } from './waterfall-chart.types';

function finite(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value);
}

/**
 * Turns items into steps with a running total; a total item shows the sum so far, or its own value
 * (an opening balance, a measured subtotal) that the next steps start from. Missing values count as zero.
 */
export function waterfallSteps(items: readonly TxWaterfallItem[]): TxWaterfallStep[] {
  let running = 0;
  return items.map((item, index) => {
    if (item.total) {
      running = finite(item.value) ? item.value : running;
      return { index, label: item.label, kind: 'total', change: running, from: 0, to: running, color: item.color ?? null };
    }
    const change = finite(item.value) ? item.value : 0;
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

/** Box of a data label: horizontal centre, width, top and bottom in px. */
export interface TxWaterfallLabelBox {
  /** Horizontal centre, in px. */
  x: number;
  /** Width, in px. */
  width: number;
  /** Top edge, in px. */
  top: number;
  /** Bottom edge, in px. */
  bottom: number;
  /** Totals are placed first, so they win a collision. */
  total: boolean;
}

/** Which data labels to draw: totals first, then left to right, leaving out any label that overlaps a kept one. */
export function visibleLabels(boxes: readonly TxWaterfallLabelBox[], gap = 4): boolean[] {
  const order = boxes.map((_, index) => index).sort((a, b) => Number(boxes[b].total) - Number(boxes[a].total) || a - b);
  const kept: TxWaterfallLabelBox[] = [];
  const visible = boxes.map(() => false);
  for (const index of order) {
    const box = boxes[index];
    const hits = kept.some(
      (other) => Math.abs(other.x - box.x) < (other.width + box.width) / 2 + gap && box.top < other.bottom && other.top < box.bottom,
    );
    if (!hits) {
      kept.push(box);
      visible[index] = true;
    }
  }
  return visible;
}
