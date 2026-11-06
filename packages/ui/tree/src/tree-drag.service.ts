import { Injectable, signal } from '@angular/core';
import { TxTreeNode, TxTreeScope } from './tree.types';

export interface TxTreeDragSource {
  removeDraggedNode(key: string): void;
}

export interface TxTreeDragState {
  node: TxTreeNode;
  scope: TxTreeScope;
  source: TxTreeDragSource;
}

@Injectable({ providedIn: 'root' })
export class TxTreeDragService {
  readonly state = signal<TxTreeDragState | null>(null);

  start(state: TxTreeDragState): void {
    this.state.set(state);
  }

  stop(): void {
    this.state.set(null);
  }
}
