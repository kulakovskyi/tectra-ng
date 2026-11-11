import { TX_FULL_CIRCLE, TxRange, polar, textWidth } from '@tectra-ng/charts/core';
import { TxRadarAxis, TxRadarChartShape, TxRadarPoint } from './radar-chart.types';

const round = (value: number) => Math.round(value * 100) / 100;

export interface TxRadarFit {
  cx: number;
  cy: number;
  radius: number;
}

export function radarAngle(index: number, count: number): number {
  return count > 0 ? (index / count) * TX_FULL_CIRCLE : 0;
}

export function radarFit(width: number, height: number, labels: readonly string[], fontSize: number, gap: number): TxRadarFit {
  const count = labels.length;
  const line = fontSize * 1.3;
  let radius = Math.min(width, height) / 2 - 4;
  labels.forEach((label, index) => {
    const angle = radarAngle(index, count);
    const sin = Math.abs(Math.sin(angle));
    const cos = Math.abs(Math.cos(angle));
    const labelWidth = textWidth(label, fontSize);
    const across = sin > 0.1 ? labelWidth : labelWidth / 2;
    const up = cos > 0.1 ? line : line / 2;
    if (sin > 1e-6) radius = Math.min(radius, (width / 2 - 2 - across) / sin - gap);
    if (cos > 1e-6) radius = Math.min(radius, (height / 2 - 2 - up) / cos - gap);
  });
  return { cx: width / 2, cy: height / 2, radius: Math.max(10, radius) };
}

export function radarAxes(labels: readonly string[], fit: TxRadarFit, gap: number): TxRadarAxis[] {
  return labels.map((label, index) => {
    const angle = radarAngle(index, labels.length);
    const end = polar(fit.cx, fit.cy, fit.radius, angle);
    const text = polar(fit.cx, fit.cy, fit.radius + gap, angle);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    return {
      index,
      label,
      angle,
      x: round(end.x),
      y: round(end.y),
      labelX: round(text.x),
      labelY: round(text.y),
      anchor: sin > 0.1 ? 'start' : sin < -0.1 ? 'end' : 'middle',
      baseline: cos > 0.1 ? 'auto' : cos < -0.1 ? 'hanging' : 'middle',
    };
  });
}

export function radarRadius(value: number, domain: TxRange, radius: number): number {
  const span = domain[1] - domain[0] || 1;
  return Math.max(0, Math.min(1, (value - domain[0]) / span)) * radius;
}

export function radarShapePath(fit: TxRadarFit, radius: number, count: number, shape: TxRadarChartShape): string {
  if (radius <= 0) return '';
  if (shape === 'circle' || count < 3) {
    const r = round(radius);
    return `M${round(fit.cx - radius)},${round(fit.cy)}a${r},${r} 0 1 0 ${round(radius * 2)},0a${r},${r} 0 1 0 ${round(-radius * 2)},0Z`;
  }
  return (
    Array.from({ length: count }, (_, index) => {
      const point = polar(fit.cx, fit.cy, radius, radarAngle(index, count));
      return `${index ? 'L' : 'M'}${round(point.x)},${round(point.y)}`;
    }).join('') + 'Z'
  );
}

export function radarPoints(values: readonly (number | null)[], domain: TxRange, fit: TxRadarFit): (TxRadarPoint | null)[] {
  return values.map((value, index) => {
    if (value === null || value === undefined || !Number.isFinite(value)) return null;
    const point = polar(fit.cx, fit.cy, radarRadius(value, domain, fit.radius), radarAngle(index, values.length));
    return { index, x: round(point.x), y: round(point.y) };
  });
}

export function radarPolygonPath(points: readonly (TxRadarPoint | null)[], fit: TxRadarFit): string {
  const drawn = points.map((point) => point ?? { x: fit.cx, y: fit.cy });
  if (!drawn.length) return '';
  return drawn.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join('') + 'Z';
}

export function radarAxisAt(x: number, y: number, fit: TxRadarFit, count: number, reach: number): number {
  const dx = x - fit.cx;
  const dy = y - fit.cy;
  if (!count || Math.hypot(dx, dy) > fit.radius + reach) return -1;
  let angle = Math.atan2(dx, -dy);
  if (angle < 0) angle += TX_FULL_CIRCLE;
  return Math.round(angle / (TX_FULL_CIRCLE / count)) % count;
}
