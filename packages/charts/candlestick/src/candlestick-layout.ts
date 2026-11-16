import { TxRange, TxTimeInterval, timeInterval, timeTickFormatter, timeTooltipFormatter, toTime } from '@tectra-ng/charts/core';
import { TxCandle } from './candlestick-chart.types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/** Timestamps of the candles when every `x` is a `Date` or an ISO date string; `null` otherwise. */
export function candleTimes(candles: readonly TxCandle[]): number[] | null {
  if (!candles.length) return null;
  const times = candles.map((candle) => (candle.x instanceof Date || (typeof candle.x === 'string' && ISO_DATE.test(candle.x)) ? toTime(candle.x) : null));
  return times.every((time): time is number => time !== null) ? times : null;
}

/** Calendar step of the candles: the step that covers the smallest gap between two of them, a day for a single candle. */
export function candleStep(times: readonly number[]): TxTimeInterval {
  let gap = Infinity;
  for (let index = 1; index < times.length; index++) {
    const next = Math.abs(times[index] - times[index - 1]);
    if (next > 0) gap = Math.min(gap, next);
  }
  return timeInterval(0, Number.isFinite(gap) ? gap : 86_400_000, 1);
}

function blankRepeats(labels: readonly string[]): string[] {
  return labels.map((label, index) => (index > 0 && label === labels[index - 1] ? '' : label));
}

function unique(labels: readonly string[]): boolean {
  return new Set(labels).size === labels.length;
}

/**
 * Axis and tooltip labels of the candles: dates formatted by the step of the data for time data, the `x` values as text
 * otherwise. Axis labels are unique: when the step format repeats a label the full date is used, and a label equal to the
 * one before it is left blank.
 */
export function candleLabels(candles: readonly TxCandle[], intl: string): { axis: string[]; full: string[] } {
  const times = candleTimes(candles);
  if (!times) {
    const labels = candles.map((candle) => String(candle.x));
    return { axis: labels, full: labels };
  }
  const interval = candleStep(times);
  const span = Math.abs(times[times.length - 1] - times[0]);
  const short = timeTickFormatter(intl, interval, span);
  const long = timeTooltipFormatter(intl, interval);
  const full = times.map((time) => long(time));
  const axis = times.map((time) => short(time));
  return { axis: blankRepeats(unique(axis) ? axis : full), full };
}

/**
 * Price range of the candles with room under it for the volume bars, which take `volumeShare` of the height (at most 0.6).
 */
export function candleExtent(candles: readonly TxCandle[], volumeShare: number): TxRange {
  if (!candles.length) return [0, 1];
  let low = Infinity;
  let high = -Infinity;
  for (const candle of candles) {
    low = Math.min(low, candle.low, candle.open, candle.close);
    high = Math.max(high, candle.high, candle.open, candle.close);
  }
  const span = high - low || Math.abs(high) * 0.1 || 1;
  const share = Math.min(0.6, Math.max(0, volumeShare));
  return [low - (span * share) / (1 - share), high];
}

/** Tells whether a candle rose, that is its close is at or above its open. */
export function isUp(candle: TxCandle): boolean {
  return candle.close >= candle.open;
}
