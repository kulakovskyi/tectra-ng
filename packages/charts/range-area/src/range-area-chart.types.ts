import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxRangeSeries {
  name: string;
  low: readonly (number | null)[];
  high: readonly (number | null)[];
  line?: readonly (number | null)[];
  color?: string;
}

export type TxRangeAreaXType = 'category' | 'time';

export type TxRangeAreaChartPart = TxChartPart | 'band' | 'edge' | 'line' | 'marker' | 'crosshair';

export interface TxRangeAreaPath {
  index: number;
  key: string;
  color: string;
  band: string;
  low: string;
  high: string;
  line: string;
}

export interface TxRangeAreaPointEvent {
  seriesIndex: number;
  dataPointIndex: number;
  category: string;
  low: number | null;
  high: number | null;
  line: number | null;
}

export interface TxRangeAreaSeriesToggle {
  seriesIndex: number;
  name: string;
  hidden: boolean;
}
