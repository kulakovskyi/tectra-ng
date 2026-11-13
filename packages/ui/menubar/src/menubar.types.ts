import { TxMenuItem } from '@tectra-ng/ui/menu';

/** Parts of `tx-menubar` that `pt` can style. */
export type TxMenubarPart =
  | 'root'
  | 'start'
  | 'end'
  | 'list'
  | 'item'
  | 'icon'
  | 'label'
  | 'badge'
  | 'submenuIcon'
  | 'separator'
  | 'submenu'
  | 'mobileButton';

/** A menu item of `tx-menubar` with its position in the tree. */
export interface TxMenubarEntry {
  /** The menu item. */
  item: TxMenuItem;
  /** Path of the entry in the tree, such as `1-0`. */
  key: string;
  /** Unique element id of the entry. */
  id: string;
  /** Depth of the entry; 0 for the top bar. */
  level: number;
  /** Entries of the item's sub-items. */
  children: TxMenubarEntry[];
}
