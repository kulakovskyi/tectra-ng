import { TxChartPart } from '@tectra-ng/charts/core';

/** Shape of the grid rings: a `polygon` or a `circle`. */
export type TxRadarChartShape = 'polygon' | 'circle';

/** Parts of `tx-radar-chart` that `pt` can style. */
export type TxRadarChartPart = TxChartPart | 'area' | 'line' | 'marker' | 'axisLine' | 'axisLabel' | 'ring';

/** One axis of the radar, from the centre to its label. */
export interface TxRadarAxis {
  /** Index of the category. */
  index: number;
  /** Category name. */
  label: string;
  /** Angle of the axis, in radians clockwise from the top. */
  angle: number;
  /** Horizontal end of the axis line, in px. */
  x: number;
  /** Vertical end of the axis line, in px. */
  y: number;
  /** Horizontal position of the label, in px. */
  labelX: number;
  /** Vertical position of the label, in px. */
  labelY: number;
  /** Text anchor of the label. */
  anchor: 'start' | 'middle' | 'end';
  /** Text baseline of the label. */
  baseline: 'auto' | 'middle' | 'hanging';
}

/** One grid ring of the radar. */
export interface TxRadarRing {
  /** Scale value of the ring. */
  value: number;
  /** Radius of the ring, in px. */
  radius: number;
  /** SVG path of the ring. */
  path: string;
  /** Formatted scale value shown on the ring. */
  label: string;
  /** Horizontal position of the ring label, in px. */
  labelX: number;
  /** Vertical position of the ring label, in px. */
  labelY: number;
}

/** One drawn point of a radar series. */
export interface TxRadarPoint {
  /** Index of the category. */
  index: number;
  /** Horizontal position, in px. */
  x: number;
  /** Vertical position, in px. */
  y: number;
}

/** One series drawn as a polygon. */
export interface TxRadarPolygon {
  /** Index of the series. */
  index: number;
  /** Stable key of the series. */
  key: string;
  /** CSS colour of the series. */
  color: string;
  /** SVG path of the polygon. */
  path: string;
  /** Points per category; `null` for a missing value. */
  points: (TxRadarPoint | null)[];
}

/** Payload of the point click event of `tx-radar-chart`. */
export interface TxRadarChartPointEvent {
  /** Index of the series. */
  seriesIndex: number;
  /** Index of the category. */
  dataPointIndex: number;
  /** Value of the point, `null` when missing. */
  value: number | null;
  /** Name of the category. */
  category: string;
}

/** Payload of the series toggle event of `tx-radar-chart`. */
export interface TxRadarChartSeriesToggle {
  /** Index of the series. */
  seriesIndex: number;
  /** Name of the series. */
  name: string;
  /** `true` when the series is now hidden. */
  hidden: boolean;
}
