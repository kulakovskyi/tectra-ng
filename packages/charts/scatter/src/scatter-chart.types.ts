import { TxChartPart } from '@tectra-ng/charts/core';

export type TxScatterX = number | string | Date;

export interface TxScatterPoint {
  x: TxScatterX;
  y: number | null;
  size?: number;
  color?: string;
  label?: string;
}

export type TxScatterTuple = readonly [TxScatterX, number | null] | readonly [TxScatterX, number | null, number];

export interface TxScatterSeries {
  name: string;
  data: readonly (TxScatterPoint | TxScatterTuple)[];
  color?: string;
}

export type TxScatterChartXType = 'linear' | 'time';

export type TxScatterChartPart = TxChartPart | 'annotation' | 'point' | 'trendLine' | 'guide';

export interface TxScatterDatum {
  series: number;
  index: number;
  x: number;
  y: number;
  size: number | null;
  color: string | null;
  label: string | null;
}

export interface TxScatterChartDot {
  key: string;
  series: number;
  index: number;
  cx: number;
  cy: number;
  r: number;
  color: string;
  order: number;
}

export interface TxScatterChartTrend {
  key: string;
  series: number;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TxScatterChartPointEvent {
  seriesIndex: number;
  dataPointIndex: number;
  x: number;
  y: number;
  size: number | null;
  label: string | null;
}

export interface TxScatterChartSeriesToggle {
  seriesIndex: number;
  name: string;
  hidden: boolean;
}
