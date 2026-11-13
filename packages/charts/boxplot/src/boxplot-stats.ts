import { TxBoxStats } from './boxplot-chart.types';

/**
 * Value at fraction `p` (0 to 1) of an ascending list, interpolated between neighbours; `NaN` for an empty list.
 */
export function quantile(sorted: readonly number[], p: number): number {
  if (!sorted.length) return NaN;
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  const high = Math.ceil(at);
  return sorted[low] + (sorted[high] - sorted[low]) * (at - low);
}

/**
 * Computes the five numbers and the outliers from raw values: whiskers reach the last values within 1.5 times the interquartile range; `null` when no value is finite.
 */
export function boxStats(values: readonly number[]): TxBoxStats | null {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const reach = (q3 - q1) * 1.5;
  const inside = sorted.filter((value) => value >= q1 - reach && value <= q3 + reach);
  return {
    min: inside[0] ?? q1,
    q1,
    median,
    q3,
    max: inside[inside.length - 1] ?? q3,
    outliers: sorted.filter((value) => value < q1 - reach || value > q3 + reach),
  };
}

/**
 * Turns a series entry (raw values or ready numbers) into `TxBoxStats`; `null` when it is empty or has a non-finite number.
 */
export function toBoxStats(entry: TxBoxStats | readonly number[] | null | undefined): TxBoxStats | null {
  if (!entry) return null;
  if (Array.isArray(entry)) return boxStats(entry as readonly number[]);
  const stats = entry as TxBoxStats;
  return [stats.min, stats.q1, stats.median, stats.q3, stats.max].every((value) => Number.isFinite(value)) ? stats : null;
}
