import { TxChartPart } from '@tectra-ng/charts/core';

export type TxGaugeTone = 'primary' | 'success' | 'info' | 'warn' | 'danger' | 'neutral';

export interface TxGaugeBand {
  from: number;
  to: number;
  tone?: TxGaugeTone;
  color?: string;
  label?: string;
}

export type TxGaugePart = Exclude<TxChartPart, 'legend' | 'legendItem' | 'tooltip'> | 'track' | 'progress' | 'band' | 'needle' | 'tick' | 'value' | 'label';

export interface TxGaugeArc {
  key: string;
  path: string;
  color: string;
  label: string | null;
}

export interface TxGaugeTick {
  value: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
  label: string;
  anchor: 'start' | 'middle' | 'end';
}
