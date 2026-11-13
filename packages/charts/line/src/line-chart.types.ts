import { TxChartCurve, TxChartPart } from '@tectra-ng/charts/core';

/** Shape of the line between points: `smooth`, `straight` or `step`. */
export type TxLineChartCurve = TxChartCurve;

/** How stacked areas add up: `normal` adds values, `100%` scales every category to 100%. */
export type TxLineChartStackType = 'normal' | '100%';

/** Parts of `tx-line-chart` that `pt` can style. */
export type TxLineChartPart = TxChartPart | 'annotation' | 'brush' | 'line' | 'area' | 'marker' | 'crosshair';

/** Payload of the point events: the point under the pointer or the clicked one. */
export interface TxLineChartPointEvent {
  /** Index of the series. */
  seriesIndex: number;
  /** Index of the category. */
  dataPointIndex: number;
  /** Value of the point; `null` for a gap. */
  value: number | null;
  /** Label of the category. */
  category: string;
}

/** Payload of `seriesToggle`: a legend item hid or showed a series. */
export interface TxLineChartSeriesToggle {
  /** Index of the series. */
  seriesIndex: number;
  /** Name of the series. */
  name: string;
  /** `true` when the series is now hidden. */
  hidden: boolean;
}

/** A point marker of a series in pixels. */
export interface TxLineChartMarker {
  /** Horizontal position. */
  x: number;
  /** Vertical position. */
  y: number;
  /** Index of the category. */
  index: number;
}

/** A series laid out as SVG paths and markers, ready to draw. */
export interface TxLineChartPath {
  /** Index of the series. */
  index: number;
  /** Stable key of the series. */
  key: string;
  /** Name of the series. */
  name: string;
  /** Color of the series. */
  color: string;
  /** SVG path of the line. */
  line: string;
  /** SVG path of the filled area under the line. */
  area: string;
  /** Point markers of the series. */
  markers: TxLineChartMarker[];
  /** Id of the gradient that fills the area. */
  gradient: string;
}
