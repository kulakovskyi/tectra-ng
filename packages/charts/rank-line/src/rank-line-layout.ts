import { toTime } from '@tectra-ng/charts/core';
import { TxRankSeries } from './rank-line.types';

export const TX_RANK_LINE_COLORS = 12;

export function rankLineColor(index: number): string {
  return `var(--tx-chart-rank-line-color${(((index % TX_RANK_LINE_COLORS) + TX_RANK_LINE_COLORS) % TX_RANK_LINE_COLORS) + 1})`;
}

export function rankTickStep(maxRank: number): number {
  return maxRank > 20 ? 10 : 5;
}

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

export function rankY(rank: number, maxRank: number, top: number, height: number): number {
  const clamped = Math.min(Math.max(rank, 0), maxRank);
  return top + (maxRank > 0 ? (clamped / maxRank) * height : 0);
}
