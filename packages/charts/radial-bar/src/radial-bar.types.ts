import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxRadialBarItem {
  label: string;
  value: number | null;
  max?: number;
  color?: string;
}

export type TxRadialBarPart = TxChartPart | 'track' | 'bar' | 'center';

export interface TxRadialBarRing {
  index: number;
  key: string;
  label: string;
  value: number;
  max: number;
  share: number;
  color: string;
  radius: number;
  width: number;
  track: string;
  bar: string;
  start: number;
  end: number;
}

export interface TxRadialBarCenter {
  label: string;
  value: string;
  index: number;
  color: string | null;
}

export interface TxRadialBarEvent {
  index: number;
  label: string;
  value: number | null;
  share: number;
}

export interface TxRadialBarToggle {
  index: number;
  label: string;
  hidden: boolean;
}
