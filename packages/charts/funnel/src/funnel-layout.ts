export interface TxFunnelBox {
  index: number;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TxFunnelLayoutInput {
  values: readonly number[];
  left: number;
  width: number;
  top: number;
  height: number;
  gapRatio: number;
  minWidth: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

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

export function funnelConnectorPath(upper: TxFunnelBox, lower: TxFunnelBox): string {
  const top = upper.y + upper.height;
  return `M${upper.x},${round(top)}L${round(upper.x + upper.width)},${round(top)}L${round(lower.x + lower.width)},${lower.y}L${lower.x},${lower.y}Z`;
}

export function funnelRate(value: number, base: number): number {
  return base > 0 ? (Math.max(0, value) / base) * 100 : 0;
}

export function funnelIndexAt(boxes: readonly TxFunnelBox[], y: number): number {
  if (!boxes.length) return -1;
  const first = boxes[0];
  const last = boxes[boxes.length - 1];
  if (y < first.y || y > last.y + last.height) return -1;
  const step = boxes.length > 1 ? boxes[1].y - first.y : first.height;
  return Math.max(0, Math.min(boxes.length - 1, Math.floor((y - first.y + (step - first.height) / 2) / step)));
}
