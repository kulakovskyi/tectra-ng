import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxSankeyNode {
  id: string;
  label?: string;
  color?: string;
}

export interface TxSankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

export type TxSankeyChartPart = TxChartPart | 'node' | 'link' | 'label';

export type TxSankeyAlign = 'justify' | 'left';

export interface TxSankeyLayoutNode {
  id: string;
  index: number;
  label: string;
  color: string;
  depth: number;
  value: number;
  incoming: number;
  outgoing: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TxSankeyLayoutLink {
  index: number;
  key: string;
  source: TxSankeyLayoutNode;
  target: TxSankeyLayoutNode;
  value: number;
  width: number;
  y0: number;
  y1: number;
  path: string;
  color: string;
}

export interface TxSankeyLayout {
  nodes: TxSankeyLayoutNode[];
  links: TxSankeyLayoutLink[];
  columns: number;
}

export interface TxSankeyNodeEvent {
  id: string;
  label: string;
  incoming: number;
  outgoing: number;
}

export interface TxSankeyLinkEvent {
  source: string;
  target: string;
  value: number;
}
