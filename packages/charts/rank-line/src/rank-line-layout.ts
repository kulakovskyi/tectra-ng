import { TxTimeInterval, timeInterval, toTime } from '@tectra-ng/charts/core';
import { TxRankSeries } from './rank-line.types';

/** Number of colours in the rank line palette; series beyond it reuse them. */
export const TX_RANK_LINE_COLORS = 12;

/** CSS colour of the series at an index, taken from the rank line palette and wrapping around. */
export function rankLineColor(index: number): string {
  return `var(--tx-chart-rank-line-color${(((index % TX_RANK_LINE_COLORS) + TX_RANK_LINE_COLORS) % TX_RANK_LINE_COLORS) + 1})`;
}

/** Distance between rank ticks: every rank up to 10 ranks, 5 up to 20, 10 deeper. */
export function rankTickStep(maxRank: number): number {
  return maxRank > 20 ? 10 : maxRank > 10 ? 5 : 1;
}

/** Ranks that get a tick: 1, then every multiple of the tick step up to `maxRank`. */
export function rankTicks(maxRank: number): number[] {
  const last = Math.max(1, Math.floor(maxRank));
  const step = rankTickStep(last);
  const ticks = [1];
  for (let rank = step; rank <= last; rank += step) {
    if (rank > 1) ticks.push(rank);
  }
  return ticks;
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

/**
 * Vertical position in px of a rank inside the plot: rank 1 on the top edge, `maxRank` on the bottom edge, deeper ranks
 * clamped to the bottom; a scale of one rank puts it in the middle.
 */
export function rankY(rank: number, maxRank: number, top: number, height: number): number {
  if (maxRank <= 1) return top + height / 2;
  const clamped = Math.min(Math.max(rank, 1), maxRank);
  return top + ((clamped - 1) / (maxRank - 1)) * height;
}

/**
 * Calendar step of the data: the step that covers the smallest gap between two times; without a gap, a day for times at
 * local midnight and a minute otherwise.
 */
export function rankTimeStep(times: readonly number[]): TxTimeInterval {
  const sorted = [...new Set(times)].sort((a, b) => a - b);
  let gap = Infinity;
  for (let index = 1; index < sorted.length; index++) gap = Math.min(gap, sorted[index] - sorted[index - 1]);
  if (Number.isFinite(gap)) return timeInterval(0, gap, 1);
  const midnight = sorted.every((time) => {
    const date = new Date(time);
    return date.getHours() === 0 && date.getMinutes() === 0;
  });
  return timeInterval(0, midnight ? 86_400_000 : 60_000, 1);
}
