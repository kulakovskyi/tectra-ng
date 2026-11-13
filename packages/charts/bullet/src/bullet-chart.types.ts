import { TxChartPart } from '@tectra-ng/charts/core';

/** One measure of `tx-bullet-chart`: a value against an optional target. */
export interface TxBulletItem {
  /** Name of the row. */
  label: string;
  /** Measured value; `null` draws no bar. */
  value: number | null;
  /** Target marker position; `null` or missing draws none. */
  target?: number | null;
  /** Thresholds of the qualitative ranges for this row; override the shared `ranges`. */
  ranges?: readonly number[];
  /** Color of the value bar. */
  color?: string;
}

/** Parts of `tx-bullet-chart` that `pt` can style. */
export type TxBulletChartPart = TxChartPart | 'range' | 'bar' | 'target';

/** One qualitative range of a row, laid out in pixels. */
export interface TxBulletRange {
  /** Stable key of the range. */
  key: string;
  /** Shade level; 1 is the darkest. */
  level: number;
  /** Left edge of the range. */
  x: number;
  /** Width of the range. */
  width: number;
}

/** A row of `tx-bullet-chart` laid out in pixels, ready to draw. */
export interface TxBulletRow {
  /** Index of the item. */
  index: number;
  /** Stable key of the row. */
  key: string;
  /** Name of the row. */
  label: string;
  /** Measured value. */
  value: number | null;
  /** Target value. */
  target: number | null;
  /** Own color of the value bar, if set. */
  color: string | null;
  /** Top of the range track. */
  trackY: number;
  /** Height of the range track. */
  trackHeight: number;
  /** Qualitative ranges of the row. */
  ranges: TxBulletRange[];
  /** Left edge of the value bar. */
  barX: number;
  /** Top of the value bar. */
  barY: number;
  /** Width of the value bar. */
  barWidth: number;
  /** Height of the value bar. */
  barHeight: number;
  /** X of the target marker; `null` without a target. */
  targetX: number | null;
  /** Top of the target marker. */
  targetY1: number;
  /** Bottom of the target marker. */
  targetY2: number;
  /** Vertical center of the row. */
  center: number;
}

/** Payload of `barClick`: the clicked row. */
export interface TxBulletEvent {
  /** Index of the item. */
  index: number;
  /** Name of the row. */
  label: string;
  /** Measured value. */
  value: number | null;
  /** Target value. */
  target: number | null;
}
