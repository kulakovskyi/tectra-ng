import { TxIconName } from '@tectra-ng/icons';

/** One node of `tx-tree`: a label with optional children and behaviour flags. */
export interface TxTreeNode<T = unknown> {
  /** Unique key of the node in the whole tree. */
  key: string;
  /** Text of the node. */
  label: string;
  /** Any data of your own; also searchable with `filterBy` like `data.code`. */
  data?: T;
  /** Icon of the node. */
  icon?: TxIconName;
  /** Icon while the node is open; replaces `icon`. */
  expandedIcon?: TxIconName;
  /** Icon while the node is closed; replaces `icon`. */
  collapsedIcon?: TxIconName;
  /** Child nodes. */
  children?: TxTreeNode<T>[];
  /** Forces the node to be a leaf (`true`) or a branch whose children load on open (`false`). */
  leaf?: boolean;
  /** Opens the node when the tree first sees it. */
  expanded?: boolean;
  /** Name of the node kind; picks the `txTreeNode="type"` template. */
  type?: string;
  /** `false` keeps the node from being selected or checked. */
  selectable?: boolean;
  /** Blocks selection, checking and dragging of the node. */
  disabled?: boolean;
  /** `false` keeps the node in place when dragging is on. */
  draggable?: boolean;
  /** `false` refuses drops inside the node. */
  droppable?: boolean;
  /** Shows the loading state on the node. */
  loading?: boolean;
  /** Extra CSS class of the node. */
  styleClass?: string;
}

/** How nodes are selected: one, several, or with checkboxes that check a whole branch. */
export type TxTreeSelectionMode = 'single' | 'multiple' | 'checkbox';
/** `lenient` keeps the whole branch under a match, `strict` only the matching descendants. */
export type TxTreeFilterMode = 'lenient' | 'strict';
/** `mask` covers the tree with a spinner, `icon` only spins the togglers of loading nodes. */
export type TxTreeLoadingMode = 'mask' | 'icon';
/** Where a dragged node lands relative to the target: before it, after it or inside it. */
export type TxTreeDropPosition = 'before' | 'after' | 'inside';
/** Name or names that decide which trees accept nodes from each other; empty means any. */
export type TxTreeScope = string | readonly string[] | null | undefined;
/** Selected node, or nodes in `multiple` / `checkbox` mode; `null` when nothing is selected. */
export type TxTreeSelection<T = unknown> = TxTreeNode<T> | TxTreeNode<T>[] | null;

/** Parts of `tx-tree` that `pt` can style. */
export type TxTreePart =
  | 'root'
  | 'header'
  | 'filter'
  | 'filterInput'
  | 'wrapper'
  | 'list'
  | 'node'
  | 'content'
  | 'toggler'
  | 'checkbox'
  | 'icon'
  | 'label'
  | 'children'
  | 'dropPoint'
  | 'empty'
  | 'mask'
  | 'footer';

/** Event of a node action: the node and the DOM event. */
export interface TxTreeNodeEvent<T = unknown> {
  /** The node the event is about. */
  node: TxTreeNode<T>;
  /** The DOM event that caused it. */
  originalEvent: Event;
}

/** Event of `nodeDrop`: what was dropped, where, and a way to confirm it. */
export interface TxTreeNodeDropEvent<T = unknown> {
  /** The dragged node. */
  dragNode: TxTreeNode<T>;
  /** The node dropped on; `null` when dropped on the empty root. */
  dropNode: TxTreeNode<T> | null;
  /** Where the node lands relative to `dropNode`. */
  position: TxTreeDropPosition;
  /** Position of the node among its new siblings. */
  index: number;
  /** The DOM event of the drop. */
  originalEvent: Event;
  /** Applies the drop; call it when `validateDrop` is on. */
  accept: () => void;
}

/** Event of `filtered`: the search text and the nodes it left. */
export interface TxTreeFilterEvent<T = unknown> {
  /** The search text. */
  filter: string;
  /** Nodes that match the search. */
  filteredValue: TxTreeNode<T>[];
}

/** Context of the `txTreeNode` template. */
export interface TxTreeNodeContext<T = unknown> {
  /** The node. */
  $implicit: TxTreeNode<T>;
  /** The node. */
  node: TxTreeNode<T>;
  /** Depth of the node, the first level is 1. */
  level: number;
  /** Whether the node is open. */
  expanded: boolean;
  /** Whether the node is selected. */
  selected: boolean;
  /** Whether the node is checked. */
  checked: boolean;
  /** Whether some, not all, descendants are checked. */
  partial: boolean;
}

/** Context of the `txTreeToggleIcon` template. */
export interface TxTreeToggleIconContext {
  /** Whether the node is open. */
  $implicit: boolean;
  /** Whether the node is open. */
  expanded: boolean;
  /** Whether the node is loading its children. */
  loading: boolean;
}

/** Context of the `txTreeCheckboxIcon` template. */
export interface TxTreeCheckboxIconContext {
  /** Whether the node is checked. */
  $implicit: boolean;
  /** Whether the node is checked. */
  checked: boolean;
  /** Whether some, not all, descendants are checked. */
  partial: boolean;
}

/** Context of the `txTreeFilter` template. */
export interface TxTreeFilterContext {
  /** Current search text. */
  $implicit: string;
  /** Current search text. */
  query: string;
  /** Searches the tree for the text. */
  filter: (query: string) => void;
  /** Clears the search. */
  reset: () => void;
}
