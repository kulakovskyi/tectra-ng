import { TxIconName } from '@tectra-ng/icons';

export interface TxTreeNode<T = unknown> {
  key: string;
  label: string;
  data?: T;
  icon?: TxIconName;
  expandedIcon?: TxIconName;
  collapsedIcon?: TxIconName;
  children?: TxTreeNode<T>[];
  leaf?: boolean;
  expanded?: boolean;
  type?: string;
  selectable?: boolean;
  disabled?: boolean;
  draggable?: boolean;
  droppable?: boolean;
  loading?: boolean;
  styleClass?: string;
}

export type TxTreeSelectionMode = 'single' | 'multiple' | 'checkbox';
export type TxTreeFilterMode = 'lenient' | 'strict';
export type TxTreeLoadingMode = 'mask' | 'icon';
export type TxTreeDropPosition = 'before' | 'after' | 'inside';
export type TxTreeScope = string | readonly string[] | null | undefined;
export type TxTreeSelection<T = unknown> = TxTreeNode<T> | TxTreeNode<T>[] | null;

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

export interface TxTreeNodeEvent<T = unknown> {
  node: TxTreeNode<T>;
  originalEvent: Event;
}

export interface TxTreeNodeDropEvent<T = unknown> {
  dragNode: TxTreeNode<T>;
  dropNode: TxTreeNode<T> | null;
  position: TxTreeDropPosition;
  index: number;
  originalEvent: Event;
  accept: () => void;
}

export interface TxTreeFilterEvent<T = unknown> {
  filter: string;
  filteredValue: TxTreeNode<T>[];
}

export interface TxTreeNodeContext<T = unknown> {
  $implicit: TxTreeNode<T>;
  node: TxTreeNode<T>;
  level: number;
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  partial: boolean;
}

export interface TxTreeToggleIconContext {
  $implicit: boolean;
  expanded: boolean;
  loading: boolean;
}

export interface TxTreeCheckboxIconContext {
  $implicit: boolean;
  checked: boolean;
  partial: boolean;
}

export interface TxTreeFilterContext {
  $implicit: string;
  query: string;
  filter: (query: string) => void;
  reset: () => void;
}
