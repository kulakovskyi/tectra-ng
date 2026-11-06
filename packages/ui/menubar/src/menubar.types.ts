import { TxMenuItem } from '@tectra-ng/ui/menu';

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

export interface TxMenubarEntry {
  item: TxMenuItem;
  key: string;
  id: string;
  level: number;
  children: TxMenubarEntry[];
}
