import { Signal } from '@angular/core';
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

/** Badge of a panel menu item: a text, a number, or a signal of one that updates the badge in place. */
export type TxPanelMenuBadge = string | number | Signal<string | number | null | undefined>;

/** Translates a label of `tx-panel-menu`: item labels, section titles and item titles are keys passed through it. */
export type TxPanelMenuTranslate = (key: string) => string;

/** One entry of `tx-panel-menu`: a menu item with nested items, an initial open state and active matching. */
export interface TxPanelMenuItem<TData = unknown> extends Omit<TxMenuItem<TData>, 'items' | 'badge' | 'command'> {
  /** Nested items shown as a submenu. */
  items?: TxPanelMenuItem<TData>[];
  /** Small badge shown at the end of the item; a signal updates it in place. */
  badge?: TxPanelMenuBadge;
  /** Called when the item is activated. */
  command?(event: TxPanelMenuItemEvent<TData>): void;
  /** Whether the submenu starts open. */
  expanded?: boolean;
  /** Marks the item as the current one, regardless of the route. */
  active?: boolean;
  /** Options that decide when `routerLink` counts as active: `{ exact }` or router match options. */
  routerLinkActiveOptions?: { exact: boolean } | Partial<IsActiveMatchOptions>;
  /**
   * Router links whose pages do not make this item active, e.g. `['/projects/owners']` on a `/projects` item that has
   * an own `/projects/owners` sibling.
   */
  routerLinkActiveExclude?: (string | readonly unknown[])[];
}

/** Payload of a panel menu item click: the original event and the clicked item. */
export interface TxPanelMenuItemEvent<TData = unknown> extends Omit<TxMenuItemEvent<TData>, 'item'> {
  /** The item that was activated. */
  item: TxPanelMenuItem<TData>;
}

/** Context of the item template of `tx-panel-menu`. */
export interface TxPanelMenuItemContext<TData = unknown> {
  /** The item being rendered. */
  $implicit: TxPanelMenuItem<TData>;
  /** The item being rendered. */
  item: TxPanelMenuItem<TData>;
  /** Label of the item, passed through `translate`. */
  label: string;
  /** Nesting depth of the item, from `0` at the top. */
  level: number;
  /** Whether the item is the current one. */
  active: boolean;
  /** Whether the submenu of the item is open. */
  expanded: boolean;
  /** Whether the item has nested items. */
  hasSubmenu: boolean;
}
