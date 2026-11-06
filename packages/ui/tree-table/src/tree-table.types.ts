export interface TxTreeTableNode<T = unknown> {
  key?: string;
  data: T;
  children?: TxTreeTableNode<T>[];
  leaf?: boolean;
  expanded?: boolean;
  selectable?: boolean;
  loading?: boolean;
}

export type TxTreeTableFilterMode = 'lenient' | 'strict';

export interface TxTreeTableNodeEvent<T = unknown> {
  node: TxTreeTableNode<T>;
  originalEvent?: Event;
}
