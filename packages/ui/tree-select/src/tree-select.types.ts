import { TxIconName } from '@tectra/icons';

export interface TxTreeNode<T = unknown> {
  key: string;
  label: string;
  data?: T;
  icon?: TxIconName;
  children?: TxTreeNode<T>[];
  selectable?: boolean;
  disabled?: boolean;
}

export type TxTreeSelectionMode = 'single' | 'multiple' | 'checkbox';
export type TxTreeSelectDisplay = 'comma' | 'chip';
export type TxTreeSelectPart = 'root' | 'box' | 'trigger' | 'value' | 'chip' | 'clear' | 'dropdown' | 'panel' | 'filter' | 'filterInput' | 'tree' | 'node' | 'toggler' | 'empty';

export interface TxTreeRow {
  id: string;
  node: TxTreeNode;
  level: number;
  parent: TxTreeRow | null;
  setSize: number;
  posInSet: number;
  hasChildren: boolean;
  expanded: boolean;
  checked: boolean;
  partial: boolean;
  selectable: boolean;
}

export interface TxTreeBranch {
  row: TxTreeRow;
  children: TxTreeBranch[];
}

export interface TxTreeSelectChangeEvent {
  value: string | string[] | null;
  node: TxTreeNode | null;
}
