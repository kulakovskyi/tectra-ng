import { TxChartPart } from '@tectra-ng/charts/core';

/** Semantic color of a gauge band. */
export type TxGaugeTone = 'primary' | 'success' | 'info' | 'warn' | 'danger' | 'neutral';

/** A colored part of the gauge scale, such as a good, fair and poor zone. */
export interface TxGaugeBand {
  /** Start of the band on the scale. */
  from: number;
  /** End of the band on the scale. */
  to: number;
  /** Semantic color of the band. */
  tone?: TxGaugeTone;
  /** Own CSS color of the band; wins over `tone`. */
  color?: string;
  /** Text of the band for screen readers. */
  label?: string;
}

/** Parts of `tx-gauge` that `pt` can style. */
export type TxGaugePart = Exclude<TxChartPart, 'legend' | 'legendItem' | 'tooltip'> | 'track' | 'progress' | 'band' | 'needle' | 'tick' | 'value' | 'label';

/** An arc of the gauge: the track, the progress or a band. */
export interface TxGaugeArc {
  /** Stable key of the arc. */
  key: string;
  /** SVG path of the arc. */
  path: string;
  /** Color of the arc. */
  color: string;
  /** Text of the arc; `null` when it has none. */
  label: string | null;
}

/** A tick mark of the gauge scale with its label. */
export interface TxGaugeTick {
  /** Value the tick stands for. */
  value: number;
  /** X of the inner end of the tick. */
  x1: number;
  /** Y of the inner end of the tick. */
  y1: number;
  /** X of the outer end of the tick. */
  x2: number;
  /** Y of the outer end of the tick. */
  y2: number;
  /** X of the tick label. */
  labelX: number;
  /** Y of the tick label. */
  labelY: number;
  /** Formatted value shown at the tick. */
  label: string;
  /** Text anchor of the label. */
  anchor: 'start' | 'middle' | 'end';
}
