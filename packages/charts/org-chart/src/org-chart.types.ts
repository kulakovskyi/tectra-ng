import { TxPillTone } from '@tectra-ng/ui/pill';

export type TxOrgChartMinimapTone = 'primary' | 'accent' | 'muted' | 'default';

export interface TxOrgChartAvatar {
  src?: string | null;
  name?: string | null;
}

export interface TxOrgChartPill {
  label: string;
  tone?: TxPillTone;
  icon?: string;
}

export interface TxOrgChartNode {
  id: string;
  kind?: string;
  title: string;
  subtitle?: string;
  avatar?: TxOrgChartAvatar;
  icon?: string;
  pills?: TxOrgChartPill[];
  children?: TxOrgChartNode[];
  collapsible?: boolean;
  expanded?: boolean;
  loading?: boolean;
  childrenEmptyText?: string;
  minimapTone?: TxOrgChartMinimapTone;
  data?: unknown;
}

export interface TxOrgChartNodeContext {
  $implicit: TxOrgChartNode;
  node: TxOrgChartNode;
  highlighted: boolean;
  inPath: boolean;
  toggle: () => void;
}

export interface TxOrgChartLabels {
  title: string;
  hint: string;
  search: string;
  matches: string;
  noMatches: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  fit: string;
  expandAll: string;
  collapseAll: string;
  fullscreen: string;
  exitFullscreen: string;
  expand: string;
  collapse: string;
  more: string;
}

export type TxOrgChartChildrenKind = 'none' | 'nodes' | 'loading' | 'empty';

export interface TxOrgChartChildrenView {
  kind: TxOrgChartChildrenKind;
  nodes: TxOrgChartNode[];
  emptyText: string;
}

export interface TxOrgChartExpandState {
  hasCollapsible: boolean;
  allExpanded: boolean;
  noneExpanded: boolean;
}

export interface TxOrgChartToolbarState {
  zoomPercent: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  hasQuery: boolean;
  matchCount: number;
  isFullscreen: boolean;
  hasContent: boolean;
  allExpanded: boolean;
  noneExpanded: boolean;
}

export interface TxOrgChartPoint {
  x: number;
  y: number;
}

export interface TxOrgChartView extends TxOrgChartPoint {
  zoom: number;
}

export interface TxOrgChartSize {
  width: number;
  height: number;
}

export interface TxOrgChartRect extends TxOrgChartPoint {
  width: number;
  height: number;
}

export interface TxOrgChartMinimapItem extends TxOrgChartRect {
  id: string;
  tone: TxOrgChartMinimapTone;
}

export interface TxOrgChartMinimapLayout {
  width: number;
  height: number;
  items: TxOrgChartMinimapItem[];
}

export interface TxOrgChartTreeState {
  highlightIds: ReadonlySet<string>;
  pathIds: ReadonlySet<string>;
  pathKinds: readonly string[] | null;
  labels: TxOrgChartLabels;
  unstyled: boolean;
}

export type TxOrgChartPart = 'root' | 'bar' | 'canvas' | 'stage' | 'card' | 'minimap' | 'toolbar' | 'hint';
