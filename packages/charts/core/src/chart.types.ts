export type TxRange = [number, number];

export interface TxContinuousScale {
  kind: 'linear' | 'log' | 'time';
  domain: TxRange;
  range: TxRange;
  map(value: number): number;
  invert(position: number): number;
  ticks(count?: number): number[];
}

export type TxTimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface TxTimeInterval {
  unit: TxTimeUnit;
  step: number;
  duration: number;
}

export interface TxTimeScale extends TxContinuousScale {
  kind: 'time';
  interval(count?: number): TxTimeInterval;
}

export interface TxBandScale {
  kind: 'band';
  count: number;
  range: TxRange;
  step: number;
  bandwidth: number;
  start(index: number): number;
  center(index: number): number;
  indexAt(position: number): number;
}

export interface TxPointScale {
  kind: 'point';
  count: number;
  range: TxRange;
  step: number;
  at(index: number): number;
  indexAt(position: number): number;
}

export type TxChartX = string | number | Date;

export interface TxChartPoint {
  x: TxChartX;
  y: number | null;
}

export interface TxChartSeries {
  name: string;
  data: readonly (number | null)[] | readonly TxChartPoint[];
  color?: string;
}

export type TxChartValueFormatter = (value: number) => string;

export type TxChartValueFormat = 'number' | 'integer' | 'compact' | 'percent' | TxChartValueFormatter;

export interface TxChartTooltipContext {
  seriesIndex: number;
  dataPointIndex: number;
}

export type TxChartTooltipFormatter = (value: number, context: TxChartTooltipContext) => string;

export type TxChartLegendPosition = 'top' | 'bottom' | 'left' | 'right';

export type TxChartLegendAlign = 'start' | 'center' | 'end';

export type TxChartLegendVariant = 'dot' | 'line' | 'pill' | 'stat';

export interface TxChartLegendItem {
  key: string;
  label: string;
  color: string;
  hidden?: boolean;
  value?: string;
  percent?: string;
  caption?: string;
}

export interface TxChartLegendContext {
  $implicit: TxChartLegendItem;
  index: number;
}

export interface TxChartTooltipRow {
  label: string;
  value: string;
  color: string;
  raw: number | null;
  seriesIndex: number;
  active?: boolean;
  share?: string;
}

export interface TxChartTooltipData {
  title: string;
  rows: TxChartTooltipRow[];
  index: number;
  x: number;
  y: number;
  placement?: TxChartTooltipPlacement;
  total?: string;
  note?: string;
}

export type TxChartTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TxChartTooltipTemplateContext {
  $implicit: TxChartTooltipData;
}

export type TxChartTooltipMode = 'shared' | 'single';

export type TxChartLabelMode = 'auto' | 'rotate' | 'skip';

export type TxChartAxisPosition = 'top' | 'bottom' | 'left' | 'right';

export type TxChartXAxisPosition = 'bottom' | 'top';

export type TxChartYAxisPosition = 'left' | 'right';

export interface TxChartTick {
  value: number;
  position: number;
  label: string;
}

export interface TxChartAxisLabel {
  text: string;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  baseline: 'auto' | 'middle' | 'hanging';
  rotate: number;
  title?: string;
}

export interface TxChartAxisModel {
  position: TxChartAxisPosition;
  labels: TxChartAxisLabel[];
  line: { x1: number; y1: number; x2: number; y2: number } | null;
  title?: { text: string; x: number; y: number; rotate: number };
}

export interface TxChartGridLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  zero?: boolean;
}

export interface TxChartAxesModel {
  axes: TxChartAxisModel[];
  grid: TxChartGridLine[];
  zero: TxChartGridLine | null;
}

export interface TxChartPlot {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface TxChartSize {
  width: number;
  height: number;
}

export interface TxChartTableColumn {
  key: string;
  label: string;
}

export interface TxChartTable {
  columns: TxChartTableColumn[];
  rows: { label: string; cells: string[] }[];
}

export type TxChartPart = 'root' | 'legend' | 'legendItem' | 'plot' | 'svg' | 'grid' | 'axis' | 'series' | 'tooltip' | 'empty' | 'skeleton';

export type TxChartHeight = number | string;

export interface TxChartPointerEvent {
  x: number;
  y: number;
  type: 'move' | 'leave' | 'click';
  target: Element | null;
}

export interface TxChartKeyEvent {
  key: string;
  event: KeyboardEvent;
}
