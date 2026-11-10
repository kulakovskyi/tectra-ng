import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxPieData {
  series: readonly number[];
  labels: readonly string[];
  title?: string;
  colors?: readonly (string | undefined)[];
}

export interface TxPieLegendItem {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export type TxPieChartPart = TxChartPart | 'segment' | 'dataLabel' | 'center';

export type TxPieTotalFormatter = (value: number) => string;

export interface TxPieFit {
  cx: number;
  cy: number;
  radius: number;
}

export interface TxPieArc {
  index: number;
  value: number;
  percent: number;
  start: number;
  end: number;
  path: string;
  labelX: number;
  labelY: number;
  middle: number;
}

export interface TxPieCenterContext {
  $implicit: TxPieCenterData;
}

export interface TxPieCenterData {
  label: string;
  value: string;
  raw: number;
  total: number;
  hovered: boolean;
  index: number;
  color: string | null;
}

export interface TxPieSegmentEvent {
  index: number;
  label: string;
  value: number;
  percent: number;
}

export interface TxPieSegmentToggle {
  index: number;
  label: string;
  hidden: boolean;
}
