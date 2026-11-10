import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxTreemapItem {
  label: string;
  value?: number;
  color?: string;
  children?: readonly TxTreemapItem[];
}

export interface TxTreemapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TxTreemapNode<T = unknown> extends TxTreemapRect {
  index: number;
  value: number;
  item: T;
}

export interface TxTreemapTile extends TxTreemapRect {
  key: string;
  index: number;
  path: readonly number[];
  label: string;
  group: string | null;
  value: number;
  share: number;
  color: string;
  nameFits: boolean;
  valueFits: boolean;
  valueText: string;
}

export interface TxTreemapTileContext {
  $implicit: TxTreemapTile;
  tile: TxTreemapTile;
  label: string;
  value: string;
  share: string;
  color: string;
  width: number;
  height: number;
}

export interface TxTreemapGroup extends TxTreemapRect {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface TxTreemapTileEvent {
  index: number;
  path: readonly number[];
  label: string;
  group: string | null;
  value: number;
  share: number;
}

export type TxTreemapPart = TxChartPart | 'tile' | 'tileContent' | 'tileLabel' | 'tileValue' | 'group' | 'groupLabel';
