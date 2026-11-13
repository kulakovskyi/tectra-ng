import { TxChartPart } from '@tectra-ng/charts/core';

/** One ring slice of `tx-sunburst-chart`; `children` form the next ring. */
export interface TxSunburstItem {
  /** Name of the slice. */
  label: string;
  /** Own value; without one the slice takes the sum of its children. */
  value?: number | null;
  /** Slices of the next ring. */
  children?: readonly TxSunburstItem[];
  /** Own colour; children inherit it. */
  color?: string;
}

/** Parts of `tx-sunburst-chart` that `pt` can style. */
export type TxSunburstChartPart = TxChartPart | 'segment' | 'label' | 'center';

/** One laid out slice with its angles, radii and shares. */
export interface TxSunburstArc {
  /** Stable key: the index path joined by dots. */
  key: string;
  /** Indexes from the top level down to the slice. */
  path: number[];
  /** The source item. */
  item: TxSunburstItem;
  /** Name of the slice. */
  label: string;
  /** Value of the slice. */
  value: number;
  /** Ring number, starting at 1 for the innermost. */
  depth: number;
  /** Start angle, in radians clockwise from the top. */
  start: number;
  /** End angle, in radians clockwise from the top. */
  end: number;
  /** Inner radius, in px. */
  inner: number;
  /** Outer radius, in px. */
  outer: number;
  /** CSS colour the slice is drawn with. */
  base: string;
  /** Share of the whole shown chart, 0 to 1. */
  share: number;
  /** Share of the parent slice, 0 to 1. */
  parentShare: number;
  /** `true` when the slice has children with a positive value. */
  hasChildren: boolean;
}

/** Payload of the slice click event of `tx-sunburst-chart`. */
export interface TxSunburstEvent {
  /** Labels from the top level down to the slice. */
  path: string[];
  /** Value of the slice. */
  value: number;
  /** The source item. */
  item: TxSunburstItem;
}
