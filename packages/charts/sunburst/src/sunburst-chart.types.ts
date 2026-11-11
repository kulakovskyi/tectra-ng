import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxSunburstItem {
  label: string;
  value?: number | null;
  children?: readonly TxSunburstItem[];
  color?: string;
}

export type TxSunburstChartPart = TxChartPart | 'segment' | 'label' | 'center';

export interface TxSunburstArc {
  key: string;
  path: number[];
  item: TxSunburstItem;
  label: string;
  value: number;
  depth: number;
  start: number;
  end: number;
  inner: number;
  outer: number;
  base: string;
  share: number;
  parentShare: number;
  hasChildren: boolean;
}

export interface TxSunburstEvent {
  path: string[];
  value: number;
  item: TxSunburstItem;
}
