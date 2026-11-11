import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxBulletItem {
  label: string;
  value: number | null;
  target?: number | null;
  ranges?: readonly number[];
  color?: string;
}

export type TxBulletChartPart = TxChartPart | 'range' | 'bar' | 'target';

export interface TxBulletRange {
  key: string;
  level: number;
  x: number;
  width: number;
}

export interface TxBulletRow {
  index: number;
  key: string;
  label: string;
  value: number | null;
  target: number | null;
  color: string | null;
  trackY: number;
  trackHeight: number;
  ranges: TxBulletRange[];
  barX: number;
  barY: number;
  barWidth: number;
  barHeight: number;
  targetX: number | null;
  targetY1: number;
  targetY2: number;
  center: number;
}

export interface TxBulletEvent {
  index: number;
  label: string;
  value: number | null;
  target: number | null;
}
