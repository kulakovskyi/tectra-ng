import { TxChartCurve, TxChartPart } from '@tectra-ng/charts/core';

export type TxLineChartCurve = TxChartCurve;

export type TxLineChartStackType = 'normal' | '100%';

export type TxLineChartPart = TxChartPart | 'annotation' | 'brush' | 'line' | 'area' | 'marker' | 'crosshair';

export interface TxLineChartPointEvent {
  seriesIndex: number;
  dataPointIndex: number;
  value: number | null;
  category: string;
}

export interface TxLineChartSeriesToggle {
  seriesIndex: number;
  name: string;
  hidden: boolean;
}

export interface TxLineChartMarker {
  x: number;
  y: number;
  index: number;
}

export interface TxLineChartPath {
  index: number;
  key: string;
  name: string;
  color: string;
  line: string;
  area: string;
  markers: TxLineChartMarker[];
  gradient: string;
}
