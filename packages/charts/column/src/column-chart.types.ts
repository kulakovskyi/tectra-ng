import { TxChartPart } from '@tectra-ng/charts/core';

export type TxColumnChartStackType = 'normal' | '100%';

export type TxColumnChartPart = TxChartPart | 'annotation' | 'bar' | 'dataLabel';

export interface TxColumnChartBar {
  key: string;
  series: number;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  end: 'top' | 'bottom' | 'left' | 'right' | null;
  dir: 'up' | 'down' | 'left' | 'right';
  label: string | null;
  labelX: number;
  labelY: number;
  inside: boolean;
}

export interface TxColumnChartPointEvent {
  seriesIndex: number;
  dataPointIndex: number;
  value: number | null;
  category: string;
}

export interface TxColumnChartSeriesToggle {
  seriesIndex: number;
  name: string;
  hidden: boolean;
}
