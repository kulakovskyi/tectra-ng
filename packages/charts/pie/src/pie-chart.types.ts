import { TxChartPart } from '@tectra-ng/charts/core';

/** Data of `tx-pie-chart`: values, one label per value and optional own colours. */
export interface TxPieData {
  /** Values of the segments; negative values count as zero. */
  series: readonly number[];
  /** One label per value, in the same order. */
  labels: readonly string[];
  /** Optional title of the data set. */
  title?: string;
  /** Own colour per segment; `undefined` takes the palette colour of its slot. */
  colors?: readonly (string | undefined)[];
}

/** One legend row of a pie chart: label, value, share and colour. */
export interface TxPieLegendItem {
  /** Label of the segment. */
  label: string;
  /** Value of the segment. */
  value: number;
  /** Share of the total, 0 to 100, not rounded. */
  percent: number;
  /** CSS colour of the segment; follows the theme. */
  color: string;
}

/** Parts of `tx-pie-chart` that `pt` can style. */
export type TxPieChartPart = TxChartPart | 'segment' | 'dataLabel' | 'center';

/** Turns the total or the hovered value into the text shown in the centre. */
export type TxPieTotalFormatter = (value: number) => string;

/** Centre and radius of the pie inside its box, in px. */
export interface TxPieFit {
  /** Horizontal centre, in px. */
  cx: number;
  /** Vertical centre, in px. */
  cy: number;
  /** Outer radius, in px. */
  radius: number;
}

/** One laid out segment: its angles in radians, SVG path and label position. */
export interface TxPieArc {
  /** Index of the value in the series. */
  index: number;
  /** Value of the segment; negative values count as zero. */
  value: number;
  /** Share of the total, 0 to 100. */
  percent: number;
  /** Start angle, in radians clockwise from the top. */
  start: number;
  /** End angle, in radians clockwise from the top. */
  end: number;
  /** SVG path of the segment. */
  path: string;
  /** Horizontal position of the data label, in px. */
  labelX: number;
  /** Vertical position of the data label, in px. */
  labelY: number;
  /** Middle angle of the segment, in radians. */
  middle: number;
}

/** Template context of `txPieCenter`. */
export interface TxPieCenterContext {
  /** What the centre shows now. */
  $implicit: TxPieCenterData;
}

/** What the centre of the donut shows: the total, or the hovered segment. */
export interface TxPieCenterData {
  /** Caption: `totalLabel`, or the name of the hovered segment. */
  label: string;
  /** Formatted value text. */
  value: string;
  /** Unformatted value. */
  raw: number;
  /** Total of all visible segments. */
  total: number;
  /** `true` while a segment is hovered or focused. */
  hovered: boolean;
  /** Index of the hovered segment, `-1` when none. */
  index: number;
  /** CSS colour of the hovered segment, `null` when none. */
  color: string | null;
}

/** Payload of `segmentClick`. */
export interface TxPieSegmentEvent {
  /** Index of the segment. */
  index: number;
  /** Label of the segment. */
  label: string;
  /** Value of the segment. */
  value: number;
  /** Share of the total, 0 to 100. */
  percent: number;
}

/** Payload of `segmentToggle`. */
export interface TxPieSegmentToggle {
  /** Index of the segment. */
  index: number;
  /** Label of the segment. */
  label: string;
  /** `true` when the segment is now hidden. */
  hidden: boolean;
}
