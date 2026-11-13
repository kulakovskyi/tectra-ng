import { TxRange, timeInterval, timeTickFormatter, timeTooltipFormatter, toTime } from '@tectra-ng/charts/core';
import { TxCandle } from './candlestick-chart.types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/** Timestamps of the candles when every `x` is a `Date` or an ISO date string; `null` otherwise. */
export function candleTimes(candles: readonly TxCandle[]): number[] | null {
  if (!candles.length) return null;
  const times = candles.map((candle) => (candle.x instanceof Date || (typeof candle.x === 'string' && ISO_DATE.test(candle.x)) ? toTime(candle.x) : null));
  return times.every((time): time is number => time !== null) ? times : null;
}

/**
 * Axis and tooltip labels of the candles: formatted dates for time data, the `x` values as text otherwise.
 */
export function candleLabels(candles: readonly TxCandle[], intl: string): { axis: string[]; full: string[] } {
  const times = candleTimes(candles);
  if (!times) {
    const labels = candles.map((candle) => String(candle.x));
    return { axis: labels, full: labels };
  }
  const span = times[times.length - 1] - times[0];
  const interval = timeInterval(times[0], times[times.length - 1] || times[0] + 1, Math.max(2, Math.min(12, times.length)));
  const axis = timeTickFormatter(intl, interval, span);
  const full = timeTooltipFormatter(intl, interval);
  return { axis: times.map((time) => axis(time)), full: times.map((time) => full(time)) };
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
