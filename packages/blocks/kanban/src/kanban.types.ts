/** One column of `tx-kanban` with its cards. */
export interface TxKanbanColumn<T> {
  /** Unique id of the column. */
  id: string;
  /** Title in the column header. */
  title: string;
  /** Cards of the column, in order. */
  items: T[];
}

/** A function that returns the id of a card. */
export type TxKanbanItemId<T> = (item: T) => string;

/** A card that was moved; the neighbours are among the shown cards of the target column. */
export interface TxKanbanItemDrop {
  /** Id of the moved card. */
  itemId: string;
  /** Column the card came from. */
  fromColumnId: string;
  /** Column the card was dropped into. */
  toColumnId: string;
  /** Id of the card above, or `null` at the top. */
  beforeId: string | null;
  /** Id of the card below, or `null` at the bottom. */
  afterId: string | null;
}

/** A column that was moved. */
export interface TxKanbanColumnDrop {
  /** Id of the moved column. */
  columnId: string;
  /** Id of the column before it, or `null` at the start. */
  beforeId: string | null;
  /** Id of the column after it, or `null` at the end. */
  afterId: string | null;
}

/** Context of the `txKanbanCard` template. */
export interface TxKanbanCardContext<T> {
  /** The card item. */
  $implicit: T;
  /** The column the card is in. */
  column: TxKanbanColumn<T>;
}

/**
 * Context of the column templates (`txKanbanColumnHeader`, `txKanbanColumnTop`,
 * `txKanbanColumnFooter`, `txKanbanEmpty`).
 */
export interface TxKanbanColumnContext<T> {
  /** The column. */
  $implicit: TxKanbanColumn<T>;
}

/** A column as the board draws it: the cards shown now and how many wait behind "Show more". */
export interface TxKanbanColumnView<T> {
  /** The column. */
  column: TxKanbanColumn<T>;
  /** The cards shown now. */
  items: T[];
  /** Number of cards not shown yet. */
  hidden: number;
}

/** Names of the parts of `tx-kanban` that its `pt` input can style. */
export type TxKanbanPart = 'root' | 'column' | 'header' | 'list' | 'card' | 'empty';
