import { TxChartPart } from '@tectra-ng/charts/core';

/** X value of a point: a number, a date string or a `Date`. */
export type TxScatterX = number | string | Date;

/** One point of `tx-scatter-chart`; `size` makes it a bubble. */
export interface TxScatterPoint {
  /** X value. */
  x: TxScatterX;
  /** Y value; `null` skips the point. */
  y: number | null;
  /** Bubble size; the area follows it, relative to the largest size. */
  size?: number;
  /** Own colour of this point. */
  color?: string;
  /** Text of the point, shown in the tooltip. */
  label?: string;
}

/** Short form of a point: `[x, y]` or `[x, y, size]`. */
export type TxScatterTuple = readonly [TxScatterX, number | null] | readonly [TxScatterX, number | null, number];

/** One group of points of `tx-scatter-chart`. */
export interface TxScatterSeries {
  /** Name of the series, shown in the legend and the tooltip. */
  name: string;
  /** Points, as objects or tuples. */
  data: readonly (TxScatterPoint | TxScatterTuple)[];
  /** Own colour; by default the palette colour of the series. */
  color?: string;
}

/** How the x values are read: on a `linear` scale or as `time`. */
export type TxScatterChartXType = 'linear' | 'time';

/** Parts of `tx-scatter-chart` that `pt` can style. */
export type TxScatterChartPart = TxChartPart | 'annotation' | 'point' | 'trendLine' | 'guide';

/** One valid point after parsing: numbers only, with its series and index. */
export interface TxScatterDatum {
  /** Index of the series. */
  series: number;
  /** Index of the point inside the series. */
  index: number;
  /** X value; a time in ms for dates. */
  x: number;
  /** Y value. */
  y: number;
  /** Bubble size, `null` without one. */
  size: number | null;
  /** Own colour of the point, `null` without one. */
  color: string | null;
  /** Text of the point, `null` without one. */
  label: string | null;
}

/** One drawn dot with its position and radius. */
export interface TxScatterChartDot {
  /** Stable key of the dot. */
  key: string;
  /** Index of the series. */
  series: number;
  /** Index of the point inside the series. */
  index: number;
  /** Horizontal centre, in px. */
  cx: number;
  /** Vertical centre, in px. */
  cy: number;
  /** Radius, in px. */
  r: number;
  /** CSS colour of the dot. */
  color: string;
  /** Group of the entrance animation: dots of different groups appear one after another. */
  order: number;
}

/** One drawn trend line. */
export interface TxScatterChartTrend {
  /** Stable key of the line. */
  key: string;
  /** Index of the series it fits. */
  series: number;
  /** CSS colour of the line. */
  color: string;
  /** Horizontal start, in px. */
  x1: number;
  /** Vertical start, in px. */
  y1: number;
  /** Horizontal end, in px. */
  x2: number;
  /** Vertical end, in px. */
  y2: number;
}

/** Payload of the point click event of `tx-scatter-chart`. */
export interface TxScatterChartPointEvent {
  /** Index of the series. */
  seriesIndex: number;
  /** Index of the point inside the series. */
  dataPointIndex: number;
  /** X value; a time in ms for dates. */
  x: number;
  /** Y value. */
  y: number;
  /** Bubble size, `null` without one. */
  size: number | null;
  /** Text of the point, `null` without one. */
  label: string | null;
}

/** Payload of the series toggle event of `tx-scatter-chart`. */
export interface TxScatterChartSeriesToggle {
  /** Index of the series. */
  seriesIndex: number;
  /** Name of the series. */
  name: string;
  /** `true` when the series is now hidden. */
  hidden: boolean;
}
