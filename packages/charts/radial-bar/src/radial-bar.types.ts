import { TxChartPart } from '@tectra-ng/charts/core';

/** One ring of `tx-radial-bar`: a label, a value and its maximum. */
export interface TxRadialBarItem {
  /** Name of the ring. */
  label: string;
  /** Value; `null` draws an empty ring. */
  value: number | null;
  /** Value that fills the ring. */
  max?: number;
  /** Own colour; by default the palette colour of the ring. */
  color?: string;
}

/** Parts of `tx-radial-bar` that `pt` can style. */
export type TxRadialBarPart = TxChartPart | 'track' | 'bar' | 'center';

/** One laid out ring: values, geometry and SVG paths of the track and the bar. */
export interface TxRadialBarRing {
  /** Index of the item. */
  index: number;
  /** Stable key of the ring. */
  key: string;
  /** Name of the ring. */
  label: string;
  /** Value of the item. */
  value: number;
  /** Value that fills the ring. */
  max: number;
  /** Filled part of the ring, 0 to 1. */
  share: number;
  /** CSS colour of the bar. */
  color: string;
  /** Radius of the ring centre line, in px. */
  radius: number;
  /** Stroke width of the ring, in px. */
  width: number;
  /** SVG path of the full track. */
  track: string;
  /** SVG path of the filled part; empty when the share is 0. */
  bar: string;
  /** Start angle of the ring, in radians. */
  start: number;
  /** End angle of the filled part, in radians. */
  end: number;
}

/** What the centre of the radial bar shows: the hovered ring, or the average share. */
export interface TxRadialBarCenter {
  /** Caption of the centre. */
  label: string;
  /** Formatted value text. */
  value: string;
  /** Index of the hovered ring, `-1` when none. */
  index: number;
  /** CSS colour of the hovered ring, `null` when none. */
  color: string | null;
}

/** Payload of the ring click event. */
export interface TxRadialBarEvent {
  /** Index of the ring. */
  index: number;
  /** Name of the ring. */
  label: string;
  /** Value of the ring, `null` when missing. */
  value: number | null;
  /** Filled part of the ring, 0 to 1. */
  share: number;
}

/** Payload of the event for a legend item hiding or showing a ring. */
export interface TxRadialBarToggle {
  /** Index of the ring. */
  index: number;
  /** Name of the ring. */
  label: string;
  /** `true` when the ring is now hidden. */
  hidden: boolean;
}
