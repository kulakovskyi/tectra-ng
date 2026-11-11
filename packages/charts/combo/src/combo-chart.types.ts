import { TxChartCurve, TxChartPart, TxChartSeries } from '@tectra-ng/charts/core';

export type TxComboChartSeriesType = 'column' | 'line' | 'area';

export type TxComboChartAxis = 'primary' | 'secondary';

export interface TxComboChartSeries extends TxChartSeries {
  type?: TxComboChartSeriesType;
  axis?: TxComboChartAxis;
}

export type TxComboChartCurve = TxChartCurve;

export type TxComboChartPart = TxChartPart | 'bar' | 'line' | 'area' | 'marker';

export interface TxComboChartBar {
  key: string;
  series: number;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  end: 'top' | 'bottom' | null;
  dir: 'up' | 'down';
}

export interface TxComboChartPoint {
  x: number;
  y: number;
  index: number;
}

export interface TxComboChartPath {
  index: number;
  key: string;
  color: string;
  line: string;
  area: string;
  points: (TxComboChartPoint | null)[];
  gradient: string;
}

export interface TxComboChartPointEvent {
  seriesIndex: number;
  dataPointIndex: number;
  value: number | null;
  category: string;
}

export interface TxComboChartSeriesToggle {
  seriesIndex: number;
  name: string;
  hidden: boolean;
}
