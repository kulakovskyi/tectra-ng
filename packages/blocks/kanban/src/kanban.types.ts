export interface TxKanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
}

export type TxKanbanItemId<T> = (item: T) => string;

export interface TxKanbanItemDrop {
  itemId: string;
  fromColumnId: string;
  toColumnId: string;
  beforeId: string | null;
  afterId: string | null;
}

export interface TxKanbanColumnDrop {
  columnId: string;
  beforeId: string | null;
  afterId: string | null;
}

export interface TxKanbanCardContext<T> {
  $implicit: T;
  column: TxKanbanColumn<T>;
}

export interface TxKanbanColumnContext<T> {
  $implicit: TxKanbanColumn<T>;
}

export interface TxKanbanColumnView<T> {
  column: TxKanbanColumn<T>;
  items: T[];
  hidden: number;
}

export type TxKanbanPart = 'root' | 'column' | 'header' | 'list' | 'card' | 'empty';
