import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxWaterfallItem {
  label: string;
  value?: number | null;
  total?: boolean;
  color?: string;
}

export type TxWaterfallKind = 'up' | 'down' | 'total';

export type TxWaterfallChartPart = TxChartPart | 'bar' | 'connector' | 'dataLabel';

export interface TxWaterfallStep {
  index: number;
  label: string;
  kind: TxWaterfallKind;
  change: number;
  from: number;
  to: number;
  color: string | null;
}

export interface TxWaterfallChartBar extends TxWaterfallStep {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string | null;
  textY: number;
  above: boolean;
}

export interface TxWaterfallConnector {
  key: string;
  x1: number;
  x2: number;
  y: number;
}

export interface TxWaterfallBarEvent {
  index: number;
  label: string;
  change: number;
  total: number;
  kind: TxWaterfallKind;
}
