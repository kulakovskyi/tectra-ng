import { TxChartPart } from '@tectra-ng/charts/core';

/** How stacked columns add up: `normal` adds values, `100%` scales every category to 100%. */
export type TxColumnChartStackType = 'normal' | '100%';

/** Parts of `tx-column-chart` that `pt` can style. */
export type TxColumnChartPart = TxChartPart | 'annotation' | 'bar' | 'dataLabel';

/** A bar of `tx-column-chart` laid out in pixels, with its label, ready to draw. */
export interface TxColumnChartBar {
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
  end: 'top' | 'bottom' | 'left' | 'right' | null;
  /** Direction the bar grows in. */
  dir: 'up' | 'down' | 'left' | 'right';
  /** Data label of the bar; `null` when there is none or it does not fit. */
  label: string | null;
  /** X of the data label. */
  labelX: number;
  /** Y of the data label. */
  labelY: number;
  /** `true` when the data label sits inside the bar. */
  inside: boolean;
}

/** Payload of the point events: the column under the pointer or the clicked one. */
export interface TxColumnChartPointEvent {
  /** Index of the series. */
  seriesIndex: number;
  /** Index of the category. */
  dataPointIndex: number;
  /** Value of the column; `null` for a gap. */
  value: number | null;
  /** Label of the category. */
  category: string;
}

/** Payload of `seriesToggle`: a legend item hid or showed a series. */
export interface TxColumnChartSeriesToggle {
  /** Index of the series. */
  seriesIndex: number;
  /** Name of the series. */
  name: string;
  /** `true` when the series is now hidden. */
  hidden: boolean;
}
