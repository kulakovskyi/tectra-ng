import { IsActiveMatchOptions } from '@angular/router';
import { TxMenuItem, TxMenuItemEvent } from '@tectra-ng/ui/menu';

export type TxPanelMenuVariant = 'panel' | 'sidebar';
export type TxPanelMenuExpandedKeys = Record<string, boolean>;
export type TxPanelMenuPart =
  | 'root'
  | 'panel'
  | 'header'
  | 'section'
  | 'tree'
  | 'item'
  | 'icon'
  | 'label'
  | 'badge'
  | 'lock'
  | 'submenuIcon'
  | 'separator';

export interface TxPanelMenuItem<TData = unknown> extends Omit<TxMenuItem<TData>, 'items'> {
  items?: TxPanelMenuItem<TData>[];
  expanded?: boolean;
  active?: boolean;
  routerLinkActiveOptions?: { exact: boolean } | Partial<IsActiveMatchOptions>;
}

export type TxPanelMenuItemEvent<TData = unknown> = TxMenuItemEvent<TData>;

export interface TxPanelMenuItemContext<TData = unknown> {
  $implicit: TxPanelMenuItem<TData>;
  item: TxPanelMenuItem<TData>;
  level: number;
  active: boolean;
  expanded: boolean;
  hasSubmenu: boolean;
}
