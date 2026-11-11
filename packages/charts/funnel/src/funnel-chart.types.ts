import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxFunnelItem {
  label: string;
  value: number | null;
  color?: string;
}

export type TxFunnelChartPart = TxChartPart | 'stage' | 'connector' | 'label' | 'value' | 'conversion';

export interface TxFunnelStage {
  index: number;
  key: string;
  label: string;
  value: number;
  ofFirst: number;
  conversion: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface TxFunnelConnector {
  key: string;
  index: number;
  path: string;
  color: string;
  textX: number;
  textY: number;
  conversion: number;
}

export interface TxFunnelStageEvent {
  index: number;
  label: string;
  value: number;
  ofFirst: number;
  conversion: number | null;
}
