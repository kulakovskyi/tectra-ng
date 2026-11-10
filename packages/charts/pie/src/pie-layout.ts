import { TxPieArc, TxPieFit } from './pie-chart.types';

const FULL = Math.PI * 2;
const round = (value: number) => Math.round(value * 100) / 100;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function polar(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
}

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

export function maxCornerRadius(inner: number, outer: number, sweep: number): number {
  const half = Math.min(Math.PI / 2, sweep / 2);
  const sin = Math.sin(half);
  const byThickness = inner > 0 ? (outer - inner) / 2 : outer / 2;
  const byOuter = (outer * sin) / (1 + sin);
  const byInner = inner > 0 && sin < 1 ? (inner * sin) / (1 - sin) : Infinity;
  return Math.max(0, Math.min(byThickness, byOuter, byInner));
}

export function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number, corner = 0): string {
  const sweep = end - start;
  if (sweep <= 0 || outer <= 0) {
    return '';
  }
  if (sweep >= FULL - 1e-6) {
    const middle = start + Math.PI;
    return arcPath(cx, cy, inner, outer, start, middle) + arcPath(cx, cy, inner, outer, middle, start + FULL);
  }
  const radius = Math.min(Math.max(0, corner), maxCornerRadius(inner, outer, sweep));
  if (radius < 0.5) {
    const large = sweep > Math.PI ? 1 : 0;
    const a = polar(cx, cy, outer, start);
    const b = polar(cx, cy, outer, end);
    const head = `M${round(a.x)},${round(a.y)}A${round(outer)},${round(outer)} 0 ${large} 1 ${round(b.x)},${round(b.y)}`;
    if (inner <= 0) {
      return `${head}L${round(cx)},${round(cy)}Z`;
    }
    const c = polar(cx, cy, inner, end);
    const d = polar(cx, cy, inner, start);
    return `${head}L${round(c.x)},${round(c.y)}A${round(inner)},${round(inner)} 0 ${large} 0 ${round(d.x)},${round(d.y)}Z`;
  }
  const r = round(radius);
  const outerShift = Math.asin(radius / (outer - radius));
  const outerReach = Math.sqrt((outer - radius) ** 2 - radius ** 2);
  const p1 = polar(cx, cy, outerReach, start);
  const p2 = polar(cx, cy, outer, start + outerShift);
  const p3 = polar(cx, cy, outer, end - outerShift);
  const p4 = polar(cx, cy, outerReach, end);
  const outerLarge = end - start - outerShift * 2 > Math.PI ? 1 : 0;
  const head =
    `M${round(p1.x)},${round(p1.y)}A${r},${r} 0 0 1 ${round(p2.x)},${round(p2.y)}` +
    `A${round(outer)},${round(outer)} 0 ${outerLarge} 1 ${round(p3.x)},${round(p3.y)}` +
    `A${r},${r} 0 0 1 ${round(p4.x)},${round(p4.y)}`;
  if (inner <= 0) {
    return `${head}L${round(cx)},${round(cy)}Z`;
  }
  const innerShift = Math.asin(radius / (inner + radius));
  const innerReach = Math.sqrt((inner + radius) ** 2 - radius ** 2);
  const p5 = polar(cx, cy, innerReach, end);
  const p6 = polar(cx, cy, inner, end - innerShift);
  const p7 = polar(cx, cy, inner, start + innerShift);
  const p8 = polar(cx, cy, innerReach, start);
  const innerLarge = end - start - innerShift * 2 > Math.PI ? 1 : 0;
  return (
    `${head}L${round(p5.x)},${round(p5.y)}A${r},${r} 0 0 1 ${round(p6.x)},${round(p6.y)}` +
    `A${round(inner)},${round(inner)} 0 ${innerLarge} 0 ${round(p7.x)},${round(p7.y)}` +
    `A${r},${r} 0 0 1 ${round(p8.x)},${round(p8.y)}Z`
  );
}

export function arcBounds(start: number, end: number): { minX: number; maxX: number; minY: number; maxY: number } {
  const points = [polar(0, 0, 1, start), polar(0, 0, 1, end), { x: 0, y: 0 }];
  for (let quarter = Math.ceil(start / (Math.PI / 2)); quarter * (Math.PI / 2) <= end; quarter++) {
    points.push(polar(0, 0, 1, quarter * (Math.PI / 2)));
  }
  return {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

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

export function arcAt(arcs: readonly TxPieArc[], fit: TxPieFit, inner: number, x: number, y: number): number {
  const dx = x - fit.cx;
  const dy = y - fit.cy;
  const distance = Math.hypot(dx, dy);
  if (distance > fit.radius + 2 || distance < inner - 2) {
    return -1;
  }
  let angle = Math.atan2(dx, -dy);
  const first = arcs.find((arc) => arc.end > arc.start)?.start ?? 0;
  while (angle < first) angle += FULL;
  while (angle >= first + FULL) angle -= FULL;
  return arcs.find((arc) => arc.end > arc.start && angle >= arc.start && angle < arc.end)?.index ?? -1;
}
