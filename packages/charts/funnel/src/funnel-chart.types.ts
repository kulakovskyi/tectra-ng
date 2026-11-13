import { TxChartPart } from '@tectra-ng/charts/core';

/** One step of `tx-funnel-chart`: a label and how many passed it. */
export interface TxFunnelItem {
  /** Name of the step. */
  label: string;
  /** Count at this step; `null` counts as 0. */
  value: number | null;
  /** Color of the step; the palette is used by default. */
  color?: string;
}

/** Parts of `tx-funnel-chart` that `pt` can style. */
export type TxFunnelChartPart = TxChartPart | 'stage' | 'connector' | 'label' | 'value' | 'conversion';

/** A step of `tx-funnel-chart` laid out in pixels, with its shares. */
export interface TxFunnelStage {
  /** Index of the step. */
  index: number;
  /** Stable key of the step. */
  key: string;
  /** Name of the step. */
  label: string;
  /** Count at this step. */
  value: number;
  /** Percent of the first step's value. */
  ofFirst: number;
  /** Percent of the step before; `null` for the first step. */
  conversion: number | null;
  /** Left edge of the bar. */
  x: number;
  /** Top of the bar. */
  y: number;
  /** Width of the bar. */
  width: number;
  /** Height of the bar. */
  height: number;
  /** Color of the bar. */
  color: string;
}

/** The soft shape between two bars, with the conversion written on it. */
export interface TxFunnelConnector {
  /** Stable key of the connector. */
  key: string;
  /** Index of the step below the connector. */
  index: number;
  /** SVG path of the connector. */
  path: string;
  /** Color of the connector. */
  color: string;
  /** X of the conversion text. */
  textX: number;
  /** Y of the conversion text. */
  textY: number;
  /** Percent of the step before. */
  conversion: number;
}

/** Payload of `stageClick`: the clicked step. */
export interface TxFunnelStageEvent {
  /** Index of the step. */
  index: number;
  /** Name of the step. */
  label: string;
  /** Count at this step. */
  value: number;
  /** Percent of the first step's value. */
  ofFirst: number;
  /** Percent of the step before; `null` for the first step. */
  conversion: number | null;
}
