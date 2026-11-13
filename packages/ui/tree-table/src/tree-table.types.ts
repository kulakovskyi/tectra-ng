/** One row of `tx-tree-table`: the cell data with optional children. */
export interface TxTreeTableNode<T = unknown> {
  /** Unique key of the row; without it the `dataKey` field of `data` is used. */
  key?: string;
  /** The values the cells read. */
  data: T;
  /** Child rows. */
  children?: TxTreeTableNode<T>[];
  /** Forces the row to be a leaf (`true`) or a branch whose children load on open (`false`). */
  leaf?: boolean;
  /** Opens the row when the table first sees it. */
  expanded?: boolean;
  /** `false` keeps the row from being selected. */
  selectable?: boolean;
  /** Shows the loading state on the row. */
  loading?: boolean;
}

/** `lenient` keeps the whole branch under a match, `strict` only the matching descendants. */
export type TxTreeTableFilterMode = 'lenient' | 'strict';

/** Event of a row being opened or closed. */
export interface TxTreeTableNodeEvent<T = unknown> {
  /** The row that was opened or closed. */
  node: TxTreeTableNode<T>;
  /** The DOM event that caused it, when there was one. */
  originalEvent?: Event;
}
