/** Rounded corners of a bar: the two of one end, all four (`all`), or none (`null`). */
export type TxBarEnd = 'top' | 'bottom' | 'left' | 'right' | 'all' | null;

/** A bar box in px. */
export interface TxBarRect {
  /** Left edge. */
  x: number;
  /** Top edge. */
  y: number;
  /** Width. */
  width: number;
  /** Height. */
  height: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * SVG path of a bar of a column, combo or waterfall chart: a rectangle whose corners on the `end` side (or all four)
 * are rounded by `radius`, shrunk so it fits the bar. The fill and a stroke drawn on it share this one shape.
 */
export function barPath(rect: TxBarRect, end: TxBarEnd, radius = 0): string {
  const x = round(rect.x);
  const y = round(rect.y);
  const w = round(rect.width);
  const h = round(rect.height);
  const vertical = end === 'top' || end === 'bottom';
  const limit = end === 'all' ? Math.min(w, h) / 2 : Math.min(vertical ? w / 2 : h / 2, vertical ? h : w);
  const r = end ? round(Math.max(0, Math.min(radius, limit))) : 0;
  if (!r) {
    return `M${x},${y}H${round(x + w)}V${round(y + h)}H${x}Z`;
  }
  const arc = (toX: number, toY: number, sweep: 0 | 1) => `A${r},${r} 0 0 ${sweep} ${round(toX)},${round(toY)}`;
  switch (end) {
    case 'top':
      return `M${x},${round(y + h)}V${round(y + r)}${arc(x + r, y, 1)}H${round(x + w - r)}${arc(x + w, y + r, 1)}V${round(y + h)}Z`;
    case 'bottom':
      return `M${x},${y}V${round(y + h - r)}${arc(x + r, y + h, 0)}H${round(x + w - r)}${arc(x + w, y + h - r, 0)}V${y}Z`;
    case 'right':
      return `M${x},${y}H${round(x + w - r)}${arc(x + w, y + r, 1)}V${round(y + h - r)}${arc(x + w - r, y + h, 1)}H${x}Z`;
    case 'left':
      return `M${round(x + w)},${y}H${round(x + r)}${arc(x, y + r, 0)}V${round(y + h - r)}${arc(x + r, y + h, 0)}H${round(x + w)}Z`;
    default:
      return (
        `M${round(x + r)},${y}H${round(x + w - r)}${arc(x + w, y + r, 1)}V${round(y + h - r)}${arc(x + w - r, y + h, 1)}` +
        `H${round(x + r)}${arc(x, y + h - r, 1)}V${round(y + r)}${arc(x + r, y, 1)}Z`
      );
  }
}
