import { TxTreeNode } from '@tectra-ng/ui/tree';

/** How several selected values show in the field: a comma list or chips. */
export type TxTreeSelectDisplay = 'comma' | 'chip';
/** Parts of `tx-tree-select` that `pt` can style. */
export type TxTreeSelectPart = 'root' | 'box' | 'trigger' | 'value' | 'chip' | 'clear' | 'dropdown' | 'panel' | 'filter' | 'filterInput' | 'tree' | 'node' | 'toggler' | 'empty';

/** One visible node of the panel tree of `tx-tree-select` with the state its template needs. */
export interface TxTreeSelectRow {
  /** DOM id of the node element. */
  id: string;
  /** The node data. */
  node: TxTreeNode;
  /** Depth of the node, the first level is 1. */
  level: number;
  /** Row of the parent node; `null` at the top. */
  parent: TxTreeSelectRow | null;
  /** Number of siblings on this level, for `aria-setsize`. */
  setSize: number;
  /** Position among the siblings from 1, for `aria-posinset`. */
  posInSet: number;
  /** Whether the node has children. */
  hasChildren: boolean;
  /** Whether the node is open. */
  expanded: boolean;
  /** Whether the node is selected or checked. */
  checked: boolean;
  /** Whether some, not all, descendants are checked. */
  partial: boolean;
  /** Whether the node can be selected or checked. */
  selectable: boolean;
}

/** A row with the branches of its children, the nested form of the panel tree. */
export interface TxTreeBranch {
  /** The row of this node. */
  row: TxTreeSelectRow;
  /** Branches of the child nodes that are shown. */
  children: TxTreeBranch[];
}

/** Event of `tx-tree-select` when the user picks a value. */
export interface TxTreeSelectChangeEvent {
  /** New value: a node key, an array of keys with several, or `null`. */
  value: string | string[] | null;
  /** The node the user acted on; `null` when the value was cleared. */
  node: TxTreeNode | null;
}
