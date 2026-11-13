import { TxPillTone } from '@tectra-ng/ui/pill';

/** Shade of a node in the minimap. */
export type TxOrgChartMinimapTone = 'primary' | 'accent' | 'muted' | 'default';

/** Picture of a node: an image, or the initials of a name when there is no image. */
export interface TxOrgChartAvatar {
  /** Address of the image. */
  src?: string | null;
  /** Name the initials are taken from and the image is described with. */
  name?: string | null;
}

/** A small badge on a node card. */
export interface TxOrgChartPill {
  /** Text of the badge. */
  label: string;
  /** Color of the badge. */
  tone?: TxPillTone;
  /** Name of an icon in front of the label. */
  icon?: string;
}

/** One node of `tx-org-chart`: a card with its own children. */
export interface TxOrgChartNode {
  /** Unique id of the node. */
  id: string;
  /**
   * Free type of the node, such as `person` or `team`; `pathKinds` picks the kinds that draw the path to the root.
   */
  kind?: string;
  /** Main text of the card. */
  title: string;
  /** Second line of the card. */
  subtitle?: string;
  /** Picture on the card; it replaces `icon`. */
  avatar?: TxOrgChartAvatar;
  /** Name of an icon on the card. */
  icon?: string;
  /** Badges under the text. */
  pills?: TxOrgChartPill[];
  /** Child nodes, drawn under the card. */
  children?: TxOrgChartNode[];
  /** Adds a chevron that opens and closes the children. */
  collapsible?: boolean;
  /** `true` when a collapsible node shows its children. */
  expanded?: boolean;
  /** Shows a skeleton card instead of the children while they load. */
  loading?: boolean;
  /** Text drawn under an open node that has no children. */
  childrenEmptyText?: string;
  /** Shade of the node in the minimap. */
  minimapTone?: TxOrgChartMinimapTone;
  /** Any data you want back in `nodeClick` and the `txOrgChartNode` template. */
  data?: unknown;
}

/** Context of the `txOrgChartNode` template. */
export interface TxOrgChartNodeContext {
  /** The node; what `let-node` binds to. */
  $implicit: TxOrgChartNode;
  /** The node. */
  node: TxOrgChartNode;
  /** `true` for a node listed in `highlightIds`. */
  highlighted: boolean;
  /** `true` when the node is on the path to the root drawn for the hovered node. */
  inPath: boolean;
  /** Opens or closes the children; emits `nodeToggle`. */
  toggle: () => void;
}

/** Texts of the toolbar and the cards of `tx-org-chart`, for translation. */
export interface TxOrgChartLabels {
  /** Title of the chart. */
  title: string;
  /** Hint on how to move and zoom the canvas. */
  hint: string;
  /** Placeholder of the search field. */
  search: string;
  /** Count of found nodes; `{count}` stands for the number. */
  matches: string;
  /** Text when the search finds nothing. */
  noMatches: string;
  /** Name of the zoom in button. */
  zoomIn: string;
  /** Name of the zoom out button. */
  zoomOut: string;
  /** Name of the button that resets the zoom to 100%. */
  resetZoom: string;
  /** Name of the button that fits the tree into the canvas. */
  fit: string;
  /** Name of the expand all button. */
  expandAll: string;
  /** Name of the collapse all button. */
  collapseAll: string;
  /** Name of the full screen button. */
  fullscreen: string;
  /** Name of the button that leaves full screen. */
  exitFullscreen: string;
  /** Name of the chevron of a closed node. */
  expand: string;
  /** Name of the chevron of an open node. */
  collapse: string;
  /** Name of the button that holds the actions on a narrow toolbar. */
  more: string;
}

/** What is drawn under a node: nothing, its children, a loading skeleton or the empty text. */
export type TxOrgChartChildrenKind = 'none' | 'nodes' | 'loading' | 'empty';

/** What `orgChartChildren` decides to draw under a node. */
export interface TxOrgChartChildrenView {
  /** What is drawn. */
  kind: TxOrgChartChildrenKind;
  /** Child nodes to draw; empty unless `kind` is `nodes`. */
  nodes: TxOrgChartNode[];
  /** Text for an open node without children. */
  emptyText: string;
}

/** Whether the collapsible nodes of a tree are open, for the expand and collapse all buttons. */
export interface TxOrgChartExpandState {
  /** `true` when the tree has any collapsible node. */
  hasCollapsible: boolean;
  /** `true` when every collapsible node is open. */
  allExpanded: boolean;
  /** `true` when every collapsible node is closed. */
  noneExpanded: boolean;
}

/** What the toolbar needs to show and enable its controls. */
export interface TxOrgChartToolbarState {
  /** Current zoom in percent. */
  zoomPercent: number;
  /** `false` at the biggest zoom. */
  canZoomIn: boolean;
  /** `false` at the smallest zoom. */
  canZoomOut: boolean;
  /** `true` when the search field has text. */
  hasQuery: boolean;
  /** Number of found nodes. */
  matchCount: number;
  /** `true` in full screen. */
  isFullscreen: boolean;
  /** `true` when the chart has nodes. */
  hasContent: boolean;
  /** `true` when every collapsible node is open. */
  allExpanded: boolean;
  /** `true` when every collapsible node is closed. */
  noneExpanded: boolean;
}

/** A point on the canvas or in the viewport, in px. */
export interface TxOrgChartPoint {
  /** Horizontal position. */
  x: number;
  /** Vertical position. */
  y: number;
}

/** Where the canvas is: its offset in px and the zoom factor. */
export interface TxOrgChartView extends TxOrgChartPoint {
  /** Zoom factor; 1 is 100%. */
  zoom: number;
}

/** Width and height in px. */
export interface TxOrgChartSize {
  /** Width in px. */
  width: number;
  /** Height in px. */
  height: number;
}

/** A rectangle in px: its top left corner and its size. */
export interface TxOrgChartRect extends TxOrgChartPoint {
  /** Width in px. */
  width: number;
  /** Height in px. */
  height: number;
}

/** A node drawn in the minimap. */
export interface TxOrgChartMinimapItem extends TxOrgChartRect {
  /** Id of the node. */
  id: string;
  /** Shade of the node. */
  tone: TxOrgChartMinimapTone;
}

/** The minimap scaled to its box. */
export interface TxOrgChartMinimapLayout {
  /** Width of the minimap in px. */
  width: number;
  /** Height of the minimap in px. */
  height: number;
  /** Nodes drawn in it. */
  items: TxOrgChartMinimapItem[];
}

/** State shared by all nodes of the tree: which are highlighted or on the path, and the texts. */
export interface TxOrgChartTreeState {
  /** Ids of the nodes that get the match outline. */
  highlightIds: ReadonlySet<string>;
  /** Ids of the nodes on the path to the root of the hovered node. */
  pathIds: ReadonlySet<string>;
  /** Node kinds that draw the path; `null` for every node. */
  pathKinds: readonly string[] | null;
  /** Texts of the chevrons and the toolbar. */
  labels: TxOrgChartLabels;
  /** `true` when the tectra styles are off. */
  unstyled: boolean;
}

/** Parts of `tx-org-chart` that `pt` can style. */
export type TxOrgChartPart = 'root' | 'bar' | 'canvas' | 'stage' | 'card' | 'minimap' | 'toolbar' | 'hint';
