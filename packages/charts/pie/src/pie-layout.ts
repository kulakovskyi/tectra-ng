import { TX_FULL_CIRCLE, arcBounds, arcPath, polar, toRadians } from '@tectra-ng/charts/core';
import { TxPieArc, TxPieFit } from './pie-chart.types';

export { arcBounds, arcPath, maxCornerRadius, polar, toRadians } from '@tectra-ng/charts/core';

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Splits a circle into start and end angles, in radians, proportional to the values; negative values get no angle.
 */
export function pieAngles(values: readonly number[], startAngle = 0, endAngle = 360): { start: number; end: number; value: number; index: number }[] {
  const start = toRadians(startAngle);
  const span = toRadians(Math.min(360, Math.max(0, endAngle - startAngle)));
  const total = values.reduce((sum, value) => sum + (value > 0 ? value : 0), 0);
  let cursor = start;
  return values.map((raw, index) => {
    const value = raw > 0 ? raw : 0;
    const sweep = total ? (value / total) * span : 0;
    const arc = { start: cursor, end: cursor + sweep, value, index };
    cursor += sweep;
    return arc;
  });
}

/** Finds the centre and the largest radius of a pie or half donut that fits a box. */
export function fitPie(width: number, height: number, startAngle = 0, endAngle = 360, padding = 4): TxPieFit {
  const start = toRadians(startAngle);
  const end = toRadians(Math.max(startAngle, Math.min(startAngle + 360, endAngle)));
  const bounds = arcBounds(start, end);
  const boxWidth = bounds.maxX - bounds.minX || 1;
  const boxHeight = bounds.maxY - bounds.minY || 1;
  const radius = Math.max(0, Math.min((width - padding * 2) / boxWidth, (height - padding * 2) / boxHeight));
  return {
    cx: width / 2 - ((bounds.minX + bounds.maxX) / 2) * radius,
    cy: height / 2 - ((bounds.minY + bounds.maxY) / 2) * radius,
    radius,
  };
}

/** Lays out the segments of a pie or donut: fit, hole radius and one arc per value. */
export function pieArcs(
  values: readonly number[],
  options: { width: number; height: number; startAngle?: number; endAngle?: number; donutSize?: number; padding?: number; cornerRadius?: number },
): { fit: TxPieFit; inner: number; arcs: TxPieArc[] } {
  const fit = fitPie(options.width, options.height, options.startAngle ?? 0, options.endAngle ?? 360, options.padding ?? 4);
  const inner = fit.radius * Math.min(0.95, Math.max(0, options.donutSize ?? 0));
  const total = values.reduce((sum, value) => sum + (value > 0 ? value : 0), 0);
  const arcs = pieAngles(values, options.startAngle ?? 0, options.endAngle ?? 360).map((angle) => {
    const middle = (angle.start + angle.end) / 2;
    const labelRadius = inner > 0 ? (inner + fit.radius) / 2 : fit.radius * 0.62;
    const label = polar(fit.cx, fit.cy, labelRadius, middle);
    return {
      index: angle.index,
      value: angle.value,
      percent: total ? (angle.value / total) * 100 : 0,
      start: angle.start,
      end: angle.end,
      path: arcPath(fit.cx, fit.cy, inner, fit.radius, angle.start, angle.end, options.cornerRadius ?? 0),
      labelX: round(label.x),
      labelY: round(label.y),
      middle,
    };
  });
  return { fit, inner, arcs };
}

/** Index of the arc under a point, or `-1` when the point is outside the ring. */
export function arcAt(arcs: readonly TxPieArc[], fit: TxPieFit, inner: number, x: number, y: number): number {
  const dx = x - fit.cx;
  const dy = y - fit.cy;
  const distance = Math.hypot(dx, dy);
  if (distance > fit.radius + 2 || distance < inner - 2) {
    return -1;
  }
  let angle = Math.atan2(dx, -dy);
  const first = arcs.find((arc) => arc.end > arc.start)?.start ?? 0;
  while (angle < first) angle += TX_FULL_CIRCLE;
  while (angle >= first + TX_FULL_CIRCLE) angle -= TX_FULL_CIRCLE;
  return arcs.find((arc) => arc.end > arc.start && angle >= arc.start && angle < arc.end)?.index ?? -1;
}
