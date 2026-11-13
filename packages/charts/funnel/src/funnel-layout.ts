/** The rectangle of one funnel step, before it gets a color and a label. */
export interface TxFunnelBox {
  /** Index of the step. */
  index: number;
  /** Count at this step. */
  value: number;
  /** Left edge of the box. */
  x: number;
  /** Top of the box. */
  y: number;
  /** Width of the box, in proportion to the value. */
  width: number;
  /** Height of the box. */
  height: number;
}

/** Values and the room they get, for `funnelBoxes`. */
export interface TxFunnelLayoutInput {
  /** Count of every step, from the first. */
  values: readonly number[];
  /** Left edge of the area. */
  left: number;
  /** Width of the area; the biggest value fills it. */
  width: number;
  /** Top of the area. */
  top: number;
  /** Height of the area. */
  height: number;
  /** Gap between boxes as a share of a box height. */
  gapRatio: number;
  /** Smallest width of a box, so small values stay visible. */
  minWidth: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Lays out one centered box per step, as wide as its value relative to the biggest. */
export function funnelBoxes(input: TxFunnelLayoutInput): TxFunnelBox[] {
  const count = input.values.length;
  if (!count) return [];
  const max = Math.max(0, ...input.values);
  const row = input.height / (count + Math.max(0, count - 1) * input.gapRatio);
  const step = row * (1 + input.gapRatio);
  const center = input.left + input.width / 2;
  return input.values.map((value, index) => {
    const width = max > 0 ? Math.max(input.minWidth, (Math.max(0, value) / max) * input.width) : input.minWidth;
    return { index, value, x: round(center - width / 2), y: round(input.top + index * step), width: round(width), height: round(row) };
  });
}

/** SVG path of the shape that joins the bottom of the upper box to the top of the lower one. */
export function funnelConnectorPath(upper: TxFunnelBox, lower: TxFunnelBox): string {
  const top = upper.y + upper.height;
  return `M${upper.x},${round(top)}L${round(upper.x + upper.width)},${round(top)}L${round(lower.x + lower.width)},${lower.y}L${lower.x},${lower.y}Z`;
}

/** Percent that `value` makes of `base`; 0 when `base` is not positive. */
export function funnelRate(value: number, base: number): number {
  return base > 0 ? (Math.max(0, value) / base) * 100 : 0;
}

/** Index of the box at a vertical position, counting the gaps to the nearest box; -1 outside the funnel. */
export function funnelIndexAt(boxes: readonly TxFunnelBox[], y: number): number {
  if (!boxes.length) return -1;
  const first = boxes[0];
  const last = boxes[boxes.length - 1];
  if (y < first.y || y > last.y + last.height) return -1;
  const step = boxes.length > 1 ? boxes[1].y - first.y : first.height;
  return Math.max(0, Math.min(boxes.length - 1, Math.floor((y - first.y + (step - first.height) / 2) / step)));
}
