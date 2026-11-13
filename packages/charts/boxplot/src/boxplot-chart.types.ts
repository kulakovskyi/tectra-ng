import { TxChartPart } from '@tectra-ng/charts/core';

/** The five numbers of one box and its outliers. */
export interface TxBoxStats {
  /** End of the lower whisker. */
  min: number;
  /** First quartile, the bottom of the box. */
  q1: number;
  /** Median, the line inside the box. */
  median: number;
  /** Third quartile, the top of the box. */
  q3: number;
  /** End of the upper whisker. */
  max: number;
  /** Values beyond the whiskers, drawn as rings. */
  outliers?: readonly number[];
}

/** One series of `tx-boxplot-chart`: a name and one box per category. */
export interface TxBoxplotSeries {
  /** Name in the legend and the tooltip. */
  name: string;
  /**
   * One entry per category: raw values (the five numbers are computed), ready `TxBoxStats` or `null` for no box.
   */
  data: readonly (TxBoxStats | readonly number[] | null)[];
  /** Color of the series; the palette is used by default. */
  color?: string;
}

/** Parts of `tx-boxplot-chart` that `pt` can style. */
export type TxBoxplotChartPart = TxChartPart | 'box' | 'median' | 'whisker' | 'outlier';

/** A box of `tx-boxplot-chart` laid out in pixels, ready to draw. */
export interface TxBoxShape {
  /** Stable key of the box. */
  key: string;
  /** Index of the series. */
  series: number;
  /** Index of the category. */
  index: number;
  /** Color of the box. */
  color: string;
  /** Left edge of the box. */
  x: number;
  /** Width of the box. */
  width: number;
  /** Horizontal center of the box. */
  center: number;
  /** Y of the first quartile. */
  q1: number;
  /** Y of the third quartile. */
  q3: number;
  /** Y of the median. */
  median: number;
  /** Y of the end of the lower whisker. */
  min: number;
  /** Y of the end of the upper whisker. */
  max: number;
  /** Width of the whisker caps. */
  capWidth: number;
  /** Outliers with their Y position and original value. */
  outliers: { key: string; y: number; value: number }[];
}

/** Payload of `boxClick`: the clicked box and its numbers. */
export interface TxBoxplotEvent {
  /** Index of the series. */
  seriesIndex: number;
  /** Index of the category. */
  dataPointIndex: number;
  /** Label of the category. */
  category: string;
  /** The five numbers and the outliers of the box. */
  stats: TxBoxStats;
}

/** Payload of `seriesToggle`: a legend item hid or showed a series. */
export interface TxBoxplotSeriesToggle {
  /** Index of the series. */
  seriesIndex: number;
  /** Name of the series. */
  name: string;
  /** `true` when the series is now hidden. */
  hidden: boolean;
}
