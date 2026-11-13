import { toTime } from '@tectra-ng/charts/core';
import { TxRankSeries } from './rank-line.types';

/** Number of colours in the rank line palette; series beyond it reuse them. */
export const TX_RANK_LINE_COLORS = 12;

/** CSS colour of the series at an index, taken from the rank line palette and wrapping around. */
export function rankLineColor(index: number): string {
  return `var(--tx-chart-rank-line-color${(((index % TX_RANK_LINE_COLORS) + TX_RANK_LINE_COLORS) % TX_RANK_LINE_COLORS) + 1})`;
}

/** Distance between rank ticks: 10 above 20 ranks, 5 otherwise. */
export function rankTickStep(maxRank: number): number {
  return maxRank > 20 ? 10 : 5;
}

/**
 * Earliest and latest time of all series in ms, widened by half a day on each side when they are equal; `null` without data.
 */
export function rankTimeExtent(series: readonly TxRankSeries[]): [number, number] | null {
  let min = Infinity;
  let max = -Infinity;
  for (const item of series) {
    for (const point of item.points) {
      const time = toTime(point.time);
      if (time !== null) {
        min = Math.min(min, time);
        max = Math.max(max, time);
      }
    }
  }
  if (!Number.isFinite(min)) return null;
  return min === max ? [min - 43_200_000, max + 43_200_000] : [min, max];
}

/** Vertical position in px of a rank inside the plot; rank 0 is at the top and ranks are clamped to the scale. */
export function rankY(rank: number, maxRank: number, top: number, height: number): number {
  const clamped = Math.min(Math.max(rank, 0), maxRank);
  return top + (maxRank > 0 ? (clamped / maxRank) * height : 0);
}
