import { TxChartPart } from '@tectra-ng/charts/core';

/** One node of `tx-sankey-chart`; links refer to it by `id`. */
export interface TxSankeyNode {
  /** Unique id that links use as `source` and `target`. */
  id: string;
  /** Text of the node; by default the `id`. */
  label?: string;
  /** Own colour; by default the palette colour of the node. */
  color?: string;
}

/** One flow between two nodes. */
export interface TxSankeyLink {
  /** `id` of the node the flow leaves. */
  source: string;
  /** `id` of the node the flow enters. */
  target: string;
  /** Size of the flow; links with a value that is not positive are dropped. */
  value: number;
  /** Own colour; by default the colour of the source node. */
  color?: string;
}

/** Parts of `tx-sankey-chart` that `pt` can style. */
export type TxSankeyChartPart = TxChartPart | 'node' | 'link' | 'label';

/**
 * Where nodes without outgoing links go: `justify` pushes them to the last column, `left` leaves them at their depth.
 */
export type TxSankeyAlign = 'justify' | 'left';

/** One laid out node with its column, size and position. */
export interface TxSankeyLayoutNode {
  /** Id of the node. */
  id: string;
  /** Index of the node in the layout. */
  index: number;
  /** Text of the node. */
  label: string;
  /** CSS colour of the node. */
  color: string;
  /** Column of the node, starting at 0. */
  depth: number;
  /** Size of the node: the larger of its incoming and outgoing sums. */
  value: number;
  /** Sum of the flows that enter the node. */
  incoming: number;
  /** Sum of the flows that leave the node. */
  outgoing: number;
  /** Left edge, in px. */
  x: number;
  /** Top edge, in px. */
  y: number;
  /** Width, in px. */
  width: number;
  /** Height, in px. */
  height: number;
}

/** One laid out flow with its ribbon path. */
export interface TxSankeyLayoutLink {
  /** Index of the link in the layout. */
  index: number;
  /** Stable key, `source>target`. */
  key: string;
  /** Node the flow leaves. */
  source: TxSankeyLayoutNode;
  /** Node the flow enters. */
  target: TxSankeyLayoutNode;
  /** Size of the flow. */
  value: number;
  /** Thickness of the ribbon, in px; at least 1. */
  width: number;
  /** Vertical centre of the ribbon at the source, in px. */
  y0: number;
  /** Vertical centre of the ribbon at the target, in px. */
  y1: number;
  /** SVG path of the ribbon. */
  path: string;
  /** CSS colour of the ribbon. */
  color: string;
}

/** Result of `sankeyLayout`: positioned nodes and links and the number of columns. */
export interface TxSankeyLayout {
  /** Laid out nodes. */
  nodes: TxSankeyLayoutNode[];
  /** Laid out links. */
  links: TxSankeyLayoutLink[];
  /** Number of columns. */
  columns: number;
}

/** Payload of the node click event of `tx-sankey-chart`. */
export interface TxSankeyNodeEvent {
  /** Id of the node. */
  id: string;
  /** Text of the node. */
  label: string;
  /** Sum of the flows that enter the node. */
  incoming: number;
  /** Sum of the flows that leave the node. */
  outgoing: number;
}

/** Payload of the link click event of `tx-sankey-chart`. */
export interface TxSankeyLinkEvent {
  /** Id of the source node. */
  source: string;
  /** Id of the target node. */
  target: string;
  /** Size of the flow. */
  value: number;
}
