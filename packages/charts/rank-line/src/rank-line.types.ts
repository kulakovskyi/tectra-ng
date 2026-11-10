import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxRankPoint {
  time: string | number | Date;
  rank: number | null;
  note?: string;
}

export interface TxRankSeries {
  name: string;
  color?: string;
  points: readonly TxRankPoint[];
}

export interface TxRankMarker {
  key: string;
  series: number;
  point: number;
  x: number;
  y: number;
  time: number;
  rank: number;
  note?: string;
}

export interface TxRankLineEvent {
  seriesIndex: number;
  pointIndex: number;
  name: string;
  time: number;
  rank: number;
  note?: string;
}

export type TxRankLinePart = TxChartPart | 'line' | 'marker';
