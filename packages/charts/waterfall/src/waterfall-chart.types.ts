import { TxChartPart } from '@tectra-ng/charts/core';

/** One step of `tx-waterfall-chart`: a change, or a running total. */
export interface TxWaterfallItem {
  /** Name of the step. */
  label: string;
  /** Change added to the running total; negative values go down. */
  value?: number | null;
  /** Draws the running total so far instead of a change. */
  total?: boolean;
  /** Own colour of the bar. */
  color?: string;
}

/** Kind of a step: `up`, `down` or `total`. */
export type TxWaterfallKind = 'up' | 'down' | 'total';

/** Parts of `tx-waterfall-chart` that `pt` can style. */
export type TxWaterfallChartPart = TxChartPart | 'bar' | 'connector' | 'dataLabel';

/** One step with its running totals. */
export interface TxWaterfallStep {
  /** Index of the item. */
  index: number;
  /** Name of the step. */
  label: string;
  /** Kind of the step. */
  kind: TxWaterfallKind;
  /** Change of the step; for a total, the running total. */
  change: number;
  /** Running total before the step. */
  from: number;
  /** Running total after the step. */
  to: number;
  /** Own colour, `null` for the default of its kind. */
  color: string | null;
}

/** One drawn bar with its position and data label. */
export interface TxWaterfallChartBar extends TxWaterfallStep {
  /** Stable key of the bar. */
  key: string;
  /** Left edge, in px. */
  x: number;
  /** Top edge, in px. */
  y: number;
  /** Width, in px. */
  width: number;
  /** Height, in px. */
  height: number;
  /** Text of the data label, `null` when labels are off. */
  text: string | null;
  /** Vertical position of the data label, in px. */
  textY: number;
  /** `true` when the data label sits above the bar. */
  above: boolean;
}

/** One line from a bar to the next one at the running total. */
export interface TxWaterfallConnector {
  /** Stable key of the connector. */
  key: string;
  /** Horizontal start, in px. */
  x1: number;
  /** Horizontal end, in px. */
  x2: number;
  /** Vertical position, in px. */
  y: number;
}

/** Payload of the bar click event of `tx-waterfall-chart`. */
export interface TxWaterfallBarEvent {
  /** Index of the bar. */
  index: number;
  /** Name of the step. */
  label: string;
  /** Change of the step. */
  change: number;
  /** Running total after the step. */
  total: number;
  /** Kind of the step. */
  kind: TxWaterfallKind;
}
