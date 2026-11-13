import { TxChartPart } from '@tectra-ng/charts/core';

/** One point of a rank line: when, which rank and an optional note. */
export interface TxRankPoint {
  /** Date, timestamp in ms or a date string. */
  time: string | number | Date;
  /** Rank at that time, 1 is the best; `null` leaves a gap. */
  rank: number | null;
  /** Text shown in the tooltip next to the rank. */
  note?: string;
}

/** One line of `tx-rank-line`: a name and its ranks over time. */
export interface TxRankSeries {
  /** Name of the series, shown in the legend and the tooltip. */
  name: string;
  /** Own colour; by default the palette colour of the series. */
  color?: string;
  /** Ranks over time. */
  points: readonly TxRankPoint[];
}

/** One drawn point of a rank line with its position. */
export interface TxRankMarker {
  /** Stable key of the marker. */
  key: string;
  /** Index of the series. */
  series: number;
  /** Index of the point inside the series. */
  point: number;
  /** Horizontal position, in px. */
  x: number;
  /** Vertical position, in px. */
  y: number;
  /** Time of the point, in ms. */
  time: number;
  /** Rank of the point. */
  rank: number;
  /** Note of the point. */
  note?: string;
}

/** Payload of the point click event of `tx-rank-line`. */
export interface TxRankLineEvent {
  /** Index of the series. */
  seriesIndex: number;
  /** Index of the point inside the series. */
  pointIndex: number;
  /** Name of the series. */
  name: string;
  /** Time of the point, in ms. */
  time: number;
  /** Rank of the point. */
  rank: number;
  /** Note of the point. */
  note?: string;
}

/** Parts of `tx-rank-line` that `pt` can style. */
export type TxRankLinePart = TxChartPart | 'line' | 'marker';
