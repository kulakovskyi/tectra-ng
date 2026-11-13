import { TxChartPart } from '@tectra-ng/charts/core';

/** One tile of `tx-treemap`; an item with `children` becomes a labelled group. */
export interface TxTreemapItem {
  /** Name of the tile or group. */
  label: string;
  /** Value that sets the tile area; a group takes the sum of its children. */
  value?: number;
  /** Own colour; children inherit it. */
  color?: string;
  /** Tiles of the group. */
  children?: readonly TxTreemapItem[];
}

/** A rectangle, in px. */
export interface TxTreemapRect {
  /** Left edge. */
  x: number;
  /** Top edge. */
  y: number;
  /** Width. */
  width: number;
  /** Height. */
  height: number;
}

/** A laid out value: its rectangle and the source item. */
export interface TxTreemapNode<T = unknown> extends TxTreemapRect {
  /** Index in the input list. */
  index: number;
  /** Value that set the area. */
  value: number;
  /** The source item. */
  item: T;
}

/** One drawn tile with its position, texts and what fits inside. */
export interface TxTreemapTile extends TxTreemapRect {
  /** Stable key of the tile. */
  key: string;
  /** Index of the tile among all tiles. */
  index: number;
  /** Indexes from the top level down to the tile. */
  path: readonly number[];
  /** Name of the tile. */
  label: string;
  /** Name of the group the tile is in, `null` on the top level. */
  group: string | null;
  /** Value of the tile. */
  value: number;
  /** Share of the total, 0 to 1. */
  share: number;
  /** CSS colour of the tile. */
  color: string;
  /** `true` when the tile is big enough for its name. */
  nameFits: boolean;
  /** `true` when the tile is big enough for the name and the value. */
  valueFits: boolean;
  /** Formatted value. */
  valueText: string;
}

/** Template context of `txTreemapTile`. */
export interface TxTreemapTileContext {
  /** The tile. */
  $implicit: TxTreemapTile;
  /** The tile. */
  tile: TxTreemapTile;
  /** Name of the tile. */
  label: string;
  /** Formatted value. */
  value: string;
  /** Formatted share of the total. */
  share: string;
  /** CSS colour of the tile. */
  color: string;
  /** Width of the tile, in px. */
  width: number;
  /** Height of the tile, in px. */
  height: number;
}

/** One drawn group frame with its label. */
export interface TxTreemapGroup extends TxTreemapRect {
  /** Stable key of the group. */
  key: string;
  /** Name of the group. */
  label: string;
  /** Sum of the values inside the group. */
  value: number;
  /** CSS colour of the group. */
  color: string;
}

/** Payload of the tile click event of `tx-treemap`. */
export interface TxTreemapTileEvent {
  /** Index of the tile. */
  index: number;
  /** Indexes from the top level down to the tile. */
  path: readonly number[];
  /** Name of the tile. */
  label: string;
  /** Name of the group the tile is in, `null` on the top level. */
  group: string | null;
  /** Value of the tile. */
  value: number;
  /** Share of the total, 0 to 1. */
  share: number;
}

/** Parts of `tx-treemap` that `pt` can style. */
export type TxTreemapPart = TxChartPart | 'tile' | 'tileContent' | 'tileLabel' | 'tileValue' | 'group' | 'groupLabel';
