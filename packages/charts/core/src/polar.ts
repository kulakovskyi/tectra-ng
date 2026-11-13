const round = (value: number) => Math.round(value * 100) / 100;

/** Full circle in radians. */
export const TX_FULL_CIRCLE = Math.PI * 2;

/** Converts degrees to radians. */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Point at a radius and an angle from a centre; the angle is in radians, `0` is straight up and it
 * grows clockwise.
 */
export function polar(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
}

/**
 * Largest corner radius that fits an arc segment with the given inner and outer radius and sweep in
 * radians.
 */
export function maxCornerRadius(inner: number, outer: number, sweep: number): number {
  const half = Math.min(Math.PI / 2, sweep / 2);
  const sin = Math.sin(half);
  const byThickness = inner > 0 ? (outer - inner) / 2 : outer / 2;
  const byOuter = (outer * sin) / (1 + sin);
  const byInner = inner > 0 && sin < 1 ? (inner * sin) / (1 - sin) : Infinity;
  return Math.max(0, Math.min(byThickness, byOuter, byInner));
}

/**
 * SVG path of a pie or donut segment from `start` to `end` radians, with optional rounded corners;
 * `inner` of `0` makes a pie slice.
 */
export function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number, corner = 0): string {
  const sweep = end - start;
  if (sweep <= 0 || outer <= 0) {
    return '';
  }
  if (sweep >= TX_FULL_CIRCLE - 1e-6) {
    const middle = start + Math.PI;
    return arcPath(cx, cy, inner, outer, start, middle) + arcPath(cx, cy, inner, outer, middle, start + TX_FULL_CIRCLE);
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

/** Bounding box of a unit-circle arc between two angles in radians. */
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

/** Centre and radius that fit an arc into a box. */
export interface TxArcFit {
  /** Horizontal centre, in px. */
  cx: number;
  /** Vertical centre, in px. */
  cy: number;
  /** Outer radius, in px. */
  radius: number;
}

/** Start and end of an arc in radians from angles in degrees; the sweep is limited to 360 degrees. */
export function arcSpan(startAngle: number, endAngle: number): [number, number] {
  const start = toRadians(startAngle);
  const end = toRadians(Math.max(startAngle, Math.min(startAngle + 360, endAngle)));
  return [start, end];
}

/**
 * Centre and radius that fit the arc between two angles in degrees into a box, leaving `padding` px
 * around it.
 */
export function fitArc(width: number, height: number, startAngle: number, endAngle: number, padding: number): TxArcFit {
  const [start, end] = arcSpan(startAngle, endAngle);
  const bounds = arcBounds(start, end);
  const boxWidth = bounds.maxX - bounds.minX || 1;
  const boxHeight = bounds.maxY - bounds.minY || 1;
  const radius = Math.max(1, Math.min((width - padding * 2) / boxWidth, (height - padding * 2) / boxHeight));
  return {
    cx: width / 2 - ((bounds.minX + bounds.maxX) / 2) * radius,
    cy: height / 2 - ((bounds.minY + bounds.maxY) / 2) * radius,
    radius,
  };
}

/** SVG path of an arc line (no fill) on a circle between two angles in radians. */
export function strokeArc(cx: number, cy: number, radius: number, start: number, end: number): string {
  const sweep = end - start;
  if (sweep <= 0 || radius <= 0) return '';
  if (sweep >= TX_FULL_CIRCLE - 1e-6) {
    const a = polar(cx, cy, radius, start);
    const b = polar(cx, cy, radius, start + Math.PI);
    const r = round(radius);
    return `M${round(a.x)},${round(a.y)}A${r},${r} 0 1 1 ${round(b.x)},${round(b.y)}A${r},${r} 0 1 1 ${round(a.x)},${round(a.y)}`;
  }
  const a = polar(cx, cy, radius, start);
  const b = polar(cx, cy, radius, end);
  const r = round(radius);
  return `M${round(a.x)},${round(a.y)}A${r},${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${round(b.x)},${round(b.y)}`;
}

/**
 * Angle in radians of a point as seen from a centre, in the range from `start` to `start` plus a full
 * circle.
 */
export function angleFrom(x: number, y: number, cx: number, cy: number, start: number): number {
  let angle = Math.atan2(x - cx, -(y - cy));
  while (angle < start) angle += TX_FULL_CIRCLE;
  while (angle >= start + TX_FULL_CIRCLE) angle -= TX_FULL_CIRCLE;
  return angle;
}
