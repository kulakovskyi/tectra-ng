import { TxChartPart } from '@tectra-ng/charts/core';

export type TxRadarChartShape = 'polygon' | 'circle';

export type TxRadarChartPart = TxChartPart | 'area' | 'line' | 'marker' | 'axisLine' | 'axisLabel' | 'ring';

export interface TxRadarAxis {
  index: number;
  label: string;
  angle: number;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  anchor: 'start' | 'middle' | 'end';
  baseline: 'auto' | 'middle' | 'hanging';
}

export interface TxRadarRing {
  value: number;
  radius: number;
  path: string;
  label: string;
  labelX: number;
  labelY: number;
}

export interface TxRadarPoint {
  index: number;
  x: number;
  y: number;
}

export interface TxRadarPolygon {
  index: number;
  key: string;
  color: string;
  path: string;
  points: (TxRadarPoint | null)[];
}

export interface TxRadarChartPointEvent {
  seriesIndex: number;
  dataPointIndex: number;
  value: number | null;
  category: string;
}

export interface TxRadarChartSeriesToggle {
  seriesIndex: number;
  name: string;
  hidden: boolean;
}
