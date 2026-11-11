import { toTime } from '@tectra-ng/charts/core';
import { TxScatterDatum, TxScatterPoint, TxScatterSeries, TxScatterTuple } from './scatter-chart.types';

function isTuple(point: TxScatterPoint | TxScatterTuple): point is TxScatterTuple {
  return Array.isArray(point);
}

export function scatterData(series: readonly TxScatterSeries[]): TxScatterDatum[][] {
  return series.map((item, seriesIndex) =>
    item.data.flatMap((point, index) => {
      const raw = isTuple(point) ? { x: point[0], y: point[1], size: point[2] } : point;
      const x = typeof raw.x === 'number' ? raw.x : toTime(raw.x);
      if (x === null || !Number.isFinite(x) || raw.y === null || raw.y === undefined || !Number.isFinite(raw.y)) return [];
      const size = raw.size === undefined || raw.size === null || !Number.isFinite(raw.size) ? null : raw.size;
      const extra = isTuple(point) ? null : point;
      return [{ series: seriesIndex, index, x, y: raw.y, size, color: extra?.color ?? null, label: extra?.label ?? null }];
    }),
  );
}

export function bubbleRadius(size: number | null, maxSize: number, min: number, max: number): number {
  if (size === null || !(maxSize > 0) || size <= 0) return min;
  return Math.max(min, max * Math.sqrt(size / maxSize));
}

export interface TxScatterTrendFit {
  slope: number;
  intercept: number;
  from: number;
  to: number;
}

export function linearTrend(points: readonly { x: number; y: number }[]): TxScatterTrendFit | null {
  if (points.length < 2) return null;
  const n = points.length;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;
  let top = 0;
  let bottom = 0;
  let from = Infinity;
  let to = -Infinity;
  for (const point of points) {
    top += (point.x - meanX) * (point.y - meanY);
    bottom += (point.x - meanX) ** 2;
    from = Math.min(from, point.x);
    to = Math.max(to, point.x);
  }
  if (!bottom) return null;
  const slope = top / bottom;
  return { slope, intercept: meanY - slope * meanX, from, to };
}

export function nearestDot<T extends { cx: number; cy: number; r: number }>(dots: readonly T[], x: number, y: number, slack: number): T | null {
  let best: T | null = null;
  let distance = Infinity;
  for (const dot of dots) {
    const next = Math.hypot(dot.cx - x, dot.cy - y);
    if (next <= Math.max(dot.r + slack, slack * 2) && (next < distance || (best && next === distance && dot.r < best.r))) {
      distance = next;
      best = dot;
    }
  }
  return best;
}
