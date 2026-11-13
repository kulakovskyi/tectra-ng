import { TxChartPart } from '@tectra-ng/charts/core';

/** One series of `tx-range-area-chart`: a band between a low and a high value, with an optional line. */
export interface TxRangeSeries {
  /** Name of the series, shown in the legend and the tooltip. */
  name: string;
  /** Lower edge of the band per category; `null` leaves a gap. */
  low: readonly (number | null)[];
  /** Upper edge of the band per category; `null` leaves a gap. */
  high: readonly (number | null)[];
  /** Optional line inside the band, for example the mean, per category. */
  line?: readonly (number | null)[];
  /** Own colour; by default the palette colour of the series. */
  color?: string;
}

/** How the x values are read: as `category` labels or as `time`. */
export type TxRangeAreaXType = 'category' | 'time';

/** Parts of `tx-range-area-chart` that `pt` can style. */
export type TxRangeAreaChartPart = TxChartPart | 'band' | 'edge' | 'line' | 'marker' | 'crosshair';

/** SVG paths of one drawn series. */
export interface TxRangeAreaPath {
  /** Index of the series. */
  index: number;
  /** Stable key of the series. */
  key: string;
  /** CSS colour of the series. */
  color: string;
  /** SVG path of the filled band. */
  band: string;
  /** SVG path of the lower edge. */
  low: string;
  /** SVG path of the upper edge. */
  high: string;
  /** SVG path of the inner line; empty without a line. */
  line: string;
}

/** Payload of the point click event of `tx-range-area-chart`. */
export interface TxRangeAreaPointEvent {
  /** Index of the series. */
  seriesIndex: number;
  /** Index of the category. */
  dataPointIndex: number;
  /** Label of the category. */
  category: string;
  /** Lower edge at the point, `null` when missing. */
  low: number | null;
  /** Upper edge at the point, `null` when missing. */
  high: number | null;
  /** Inner line value at the point, `null` when missing. */
  line: number | null;
}

/** Payload of the series toggle event of `tx-range-area-chart`. */
export interface TxRangeAreaSeriesToggle {
  /** Index of the series. */
  seriesIndex: number;
  /** Name of the series. */
  name: string;
  /** `true` when the series is now hidden. */
  hidden: boolean;
}
