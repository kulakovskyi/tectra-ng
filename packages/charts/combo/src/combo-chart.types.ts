import { TxChartCurve, TxChartPart, TxChartSeries } from '@tectra-ng/charts/core';

/** How a series of `tx-combo-chart` is drawn: as `column`, `line` or `area`. */
export type TxComboChartSeriesType = 'column' | 'line' | 'area';

/** Value axis a series is scaled on: the main one or the second one on the other side. */
export type TxComboChartAxis = 'primary' | 'secondary';

/** One series of `tx-combo-chart`: the common series fields plus how it is drawn and on which axis. */
export interface TxComboChartSeries extends TxChartSeries {
  /** `column` (default), `line` or `area`. */
  type?: TxComboChartSeriesType;
  /** `primary` (default) or `secondary`. */
  axis?: TxComboChartAxis;
}

/** Curve of the line and area series; the same values as in the line chart. */
export type TxComboChartCurve = TxChartCurve;

/** Parts of `tx-combo-chart` that `pt` can style. */
export type TxComboChartPart = TxChartPart | 'annotation' | 'bar' | 'line' | 'area' | 'marker';

/** A column of `tx-combo-chart` laid out in pixels, ready to draw. */
export interface TxComboChartBar {
  /** Stable key of the bar. */
  key: string;
  /** Index of the series. */
  series: number;
  /** Index of the category. */
  index: number;
  /** Left edge of the bar. */
  x: number;
  /** Top of the bar. */
  y: number;
  /** Width of the bar. */
  width: number;
  /** Height of the bar. */
  height: number;
  /** Color of the bar. */
  color: string;
  /** Side with the rounded end of the bar; `null` for a bar that is not the outermost of a stack. */
  end: 'top' | 'bottom' | null;
  /** Direction the bar grows in. */
  dir: 'up' | 'down';
}

/** A point of a line or area series in pixels. */
export interface TxComboChartPoint {
  /** Horizontal position. */
  x: number;
  /** Vertical position. */
  y: number;
  /** Index of the category. */
  index: number;
}

/** A line or area series laid out as SVG paths, ready to draw. */
export interface TxComboChartPath {
  /** Index of the series. */
  index: number;
  /** Stable key of the series. */
  key: string;
  /** Color of the series. */
  color: string;
  /** SVG path of the line. */
  line: string;
  /** SVG path of the filled area under the line. */
  area: string;
  /** Points of the series; `null` for a gap. */
  points: (TxComboChartPoint | null)[];
  /** Id of the gradient that fills the area. */
  gradient: string;
}

/** Payload of the point events: the point under the pointer or the clicked one. */
export interface TxComboChartPointEvent {
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
export interface TxComboChartSeriesToggle {
  /** Index of the series. */
  seriesIndex: number;
  /** Name of the series. */
  name: string;
  /** `true` when the series is now hidden. */
  hidden: boolean;
}
