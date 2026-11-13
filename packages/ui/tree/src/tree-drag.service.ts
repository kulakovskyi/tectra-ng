import { Injectable, signal } from '@angular/core';
import { TxTreeNode, TxTreeScope } from './tree.types';

/** A tree that can give up a node dragged out of it into another tree. */
export interface TxTreeDragSource {
  /** Removes the node with the key from this tree after it was dropped elsewhere. */
  removeDraggedNode(key: string): void;
}

/** The drag in progress: the node, its scope and the tree it comes from. */
export interface TxTreeDragState {
  /** The dragged node. */
  node: TxTreeNode;
  /** Scope of the dragged node, matched against `droppableScope` of the target tree. */
  scope: TxTreeScope;
  /** The tree the node is dragged from. */
  source: TxTreeDragSource;
}

/** Shares the running drag between trees, so a node can move from one `tx-tree` to another. */
@Injectable({ providedIn: 'root' })
export class TxTreeDragService {
  /** Signal of the running drag; `null` when nothing is dragged. */
  readonly state = signal<TxTreeDragState | null>(null);

  /** Records that a drag began. */
  start(state: TxTreeDragState): void {
    this.state.set(state);
  }

  /** Records that the drag ended. */
  stop(): void {
    this.state.set(null);
  }
}
