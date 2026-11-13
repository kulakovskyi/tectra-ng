import { IsActiveMatchOptions } from '@angular/router';
import { TxMenuItem, TxMenuItemEvent } from '@tectra-ng/ui/menu';

/** Look of `tx-panel-menu`: `panel` (titled blocks) or `sidebar` (flat navigation). */
export type TxPanelMenuVariant = 'panel' | 'sidebar';
/** Open state of submenus by item key: `true` for an expanded item. */
export type TxPanelMenuExpandedKeys = Record<string, boolean>;
/** Parts of `tx-panel-menu` that `pt` can style. */
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

/** One entry of `tx-panel-menu`: a menu item with nested items, an initial open state and active matching. */
export interface TxPanelMenuItem<TData = unknown> extends Omit<TxMenuItem<TData>, 'items'> {
  /** Nested items shown as a submenu. */
  items?: TxPanelMenuItem<TData>[];
  /** Whether the submenu starts open. */
  expanded?: boolean;
  /** Marks the item as the current one, regardless of the route. */
  active?: boolean;
  /** Options that decide when `routerLink` counts as active: `{ exact }` or router match options. */
  routerLinkActiveOptions?: { exact: boolean } | Partial<IsActiveMatchOptions>;
}

/** Payload of a panel menu item click: the original event and the clicked item. */
export type TxPanelMenuItemEvent<TData = unknown> = TxMenuItemEvent<TData>;

/** Context of the item template of `tx-panel-menu`. */
export interface TxPanelMenuItemContext<TData = unknown> {
  /** The item being rendered. */
  $implicit: TxPanelMenuItem<TData>;
  /** The item being rendered. */
  item: TxPanelMenuItem<TData>;
  /** Nesting depth of the item, from `0` at the top. */
  level: number;
  /** Whether the item is the current one. */
  active: boolean;
  /** Whether the submenu of the item is open. */
  expanded: boolean;
  /** Whether the item has nested items. */
  hasSubmenu: boolean;
}
