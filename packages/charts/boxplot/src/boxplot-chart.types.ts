import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxBoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: readonly number[];
}

export interface TxBoxplotSeries {
  name: string;
  data: readonly (TxBoxStats | readonly number[] | null)[];
  color?: string;
}

export type TxBoxplotChartPart = TxChartPart | 'box' | 'median' | 'whisker' | 'outlier';

export interface TxBoxShape {
  key: string;
  series: number;
  index: number;
  color: string;
  x: number;
  width: number;
  center: number;
  q1: number;
  q3: number;
  median: number;
  min: number;
  max: number;
  capWidth: number;
  outliers: { key: string; y: number; value: number }[];
}

export interface TxBoxplotEvent {
  seriesIndex: number;
  dataPointIndex: number;
  category: string;
  stats: TxBoxStats;
}

export interface TxBoxplotSeriesToggle {
  seriesIndex: number;
  name: string;
  hidden: boolean;
}
