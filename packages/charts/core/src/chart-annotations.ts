import { TxChartPlot, TxChartX } from './chart.types';
import { textWidth } from './format';

export type TxChartAnnotationTone = 'neutral' | 'primary' | 'success' | 'info' | 'warn' | 'danger';

interface TxChartAnnotationBase {
  label?: string;
  tone?: TxChartAnnotationTone;
  color?: string;
}

export interface TxChartXLine extends TxChartAnnotationBase {
  type: 'x-line';
  x: TxChartX;
}

export interface TxChartYLine extends TxChartAnnotationBase {
  type: 'y-line';
  y: number;
  axis?: 'primary' | 'secondary';
}

export interface TxChartXBand extends TxChartAnnotationBase {
  type: 'x-band';
  from: TxChartX;
  to: TxChartX;
}

export interface TxChartYBand extends TxChartAnnotationBase {
  type: 'y-band';
  from: number;
  to: number;
  axis?: 'primary' | 'secondary';
}

export interface TxChartPointAnnotation extends TxChartAnnotationBase {
  type: 'point';
  x: TxChartX;
  y: number;
  axis?: 'primary' | 'secondary';
}

export type TxChartAnnotation = TxChartXLine | TxChartYLine | TxChartXBand | TxChartYBand | TxChartPointAnnotation;

export interface TxChartAnnotationMapping {
  plot: TxChartPlot;
  x(value: TxChartX): number | null;
  xSpan?(value: TxChartX): [number, number] | null;
  y(value: number, axis: 'primary' | 'secondary'): number | null;
  horizontal?: boolean;
}

export interface TxChartAnnotationShape {
  key: string;
  kind: 'line' | 'band' | 'point';
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: { text: string; x: number; y: number; width: number; height: number; anchor: 'start' | 'end' | 'middle' } | null;
}

const LABEL_FONT = 11;
const LABEL_PAD = 6;
const LABEL_HEIGHT = 18;
const LABEL_GAP = 4;

export function chartCategoryIndex(value: TxChartX, labels: readonly string[]): number {
  if (typeof value === 'number') return Number.isInteger(value) && value >= 0 && value < labels.length ? value : -1;
  return labels.indexOf(value instanceof Date ? value.toISOString() : String(value));
}

function colorOf(item: TxChartAnnotationBase): string {
  return item.color ?? `var(--tx-chart-annotation-${item.tone ?? 'neutral'}-color)`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function chartAnnotationShapes(list: readonly TxChartAnnotation[] | null | undefined, mapping: TxChartAnnotationMapping): TxChartAnnotationShape[] {
  const { plot } = mapping;
  const left = plot.left;
  const right = plot.left + plot.width;
  const top = plot.top;
  const bottom = plot.top + plot.height;
  const pill = (text: string | undefined, x: number, y: number, anchor: 'start' | 'end' | 'middle') => {
    if (!text) return null;
    const width = textWidth(text, LABEL_FONT) + LABEL_PAD * 2;
    const start = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;
    const fitted = clamp(start, left, Math.max(left, right - width));
    return { text, x: fitted, y: clamp(y, top, Math.max(top, bottom - LABEL_HEIGHT)), width, height: LABEL_HEIGHT, anchor };
  };
  const along = (value: TxChartX) => mapping.x(value);
  const across = (value: number, axis: 'primary' | 'secondary' = 'primary') => mapping.y(value, axis);
  const shapes: TxChartAnnotationShape[] = [];
  (list ?? []).forEach((item, index) => {
    const color = colorOf(item);
    const key = `${index}:${item.type}`;
    if (item.type === 'x-line' || item.type === 'y-line') {
      const value = item.type === 'x-line' ? along(item.x) : across(item.y, item.axis);
      if (value === null) return;
      const vertical = (item.type === 'x-line') !== !!mapping.horizontal;
      if (vertical) {
        if (value < left - 0.5 || value > right + 0.5) return;
        shapes.push({ key, kind: 'line', color, x1: value, y1: top, x2: value, y2: bottom, label: pill(item.label, value + LABEL_GAP, top + LABEL_GAP, 'start') });
      } else {
        if (value < top - 0.5 || value > bottom + 0.5) return;
        shapes.push({ key, kind: 'line', color, x1: left, y1: value, x2: right, y2: value, label: pill(item.label, right - LABEL_GAP, value - LABEL_HEIGHT - LABEL_GAP, 'end') });
      }
      return;
    }
    if (item.type === 'x-band' || item.type === 'y-band') {
      let a: number | null;
      let b: number | null;
      if (item.type === 'x-band') {
        const from = mapping.xSpan ? mapping.xSpan(item.from) : null;
        const to = mapping.xSpan ? mapping.xSpan(item.to) : null;
        a = from ? Math.min(from[0], from[1]) : along(item.from);
        b = to ? Math.max(to[0], to[1]) : along(item.to);
      } else {
        a = across(item.from, item.axis);
        b = across(item.to, item.axis);
      }
      if (a === null || b === null) return;
      const vertical = (item.type === 'x-band') !== !!mapping.horizontal;
      if (vertical) {
        const x1 = clamp(Math.min(a, b), left, right);
        const x2 = clamp(Math.max(a, b), left, right);
        if (x2 - x1 < 0.5) return;
        shapes.push({ key, kind: 'band', color, x1, y1: top, x2, y2: bottom, label: pill(item.label, x1 + LABEL_GAP, top + LABEL_GAP, 'start') });
      } else {
        const y1 = clamp(Math.min(a, b), top, bottom);
        const y2 = clamp(Math.max(a, b), top, bottom);
        if (y2 - y1 < 0.5) return;
        shapes.push({ key, kind: 'band', color, x1: left, y1, x2: right, y2, label: pill(item.label, left + LABEL_GAP, y1 + LABEL_GAP, 'start') });
      }
      return;
    }
    const x = along(item.x);
    const y = across(item.y, item.axis);
    if (x === null || y === null) return;
    const [px, py] = mapping.horizontal ? [y, x] : [x, y];
    if (px < left - 0.5 || px > right + 0.5 || py < top - 0.5 || py > bottom + 0.5) return;
    shapes.push({ key, kind: 'point', color, x1: px, y1: py, x2: px, y2: py, label: pill(item.label, px, py - LABEL_HEIGHT - LABEL_GAP * 2, 'middle') });
  });
  return shapes;
}
