/** Color role of a menu item; `danger` marks destructive actions. */
export type TxMenuItemSeverity = 'danger';
/** Color of the icon button of an item in `tx-context-menu`. */
export type TxMenuIconSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
/** Parts of `tx-menu` and its variants that `pt` can style. */
export type TxMenuPart = 'root' | 'item' | 'icon' | 'label' | 'shortcut' | 'badge' | 'separator' | 'groupLabel' | 'submenuIcon';

/** Event of a menu item click or command. */
export interface TxMenuItemEvent<TData = unknown> {
  /** The item that was activated. */
  item: TxMenuItem<TData>;
  /** Browser event that activated the item. */
  originalEvent: Event;
}

/** One entry of a menu: a command, a link, a separator or a group of sub-items. */
export interface TxMenuItem<TData = unknown> {
  /** Identifier of the item, for your own use. */
  id?: string;
  /** Text of the item. */
  label?: string;
  /** Icon name or icon class shown before the label. */
  icon?: string;
  /** Color of the icon button in `tx-context-menu` (default `primary`). */
  iconSeverity?: TxMenuIconSeverity;
  /** Called when the item is activated. */
  command?: (event: TxMenuItemEvent<TData>) => void;
  /** Router commands the item links to. */
  routerLink?: string | readonly unknown[];
  /** Query parameters of the `routerLink`. */
  queryParams?: Record<string, unknown>;
  /** Fragment of the `routerLink`. */
  fragment?: string;
  /** External address the item links to. */
  url?: string;
  /** Link target of `url`, such as `_blank`. */
  target?: string;
  /** Makes the item inactive. */
  disabled?: boolean;
  /** Set to `false` to hide the item. */
  visible?: boolean;
  /** Renders a divider line instead of an item. */
  separator?: boolean;
  /** Marks the item as `danger`. */
  severity?: TxMenuItemSeverity;
  /** Small badge shown at the end of the item. */
  badge?: string | number;
  /** Shortcut text shown at the end of the item; display only, bind the keys yourself. */
  shortcut?: string;
  /** Tooltip text of the item. */
  title?: string;
  /** Child items: a group in `tx-menu`, a sub-menu in `tx-tiered-menu` and `tx-context-menu`. */
  items?: TxMenuItem<TData>[];
  /** Your own data, passed back in events and templates. */
  data?: TData;
}

/** Context of a `txMenuItem` template: one menu item. */
export interface TxMenuItemContext<TData = unknown> {
  /** The item to render. */
  $implicit: TxMenuItem<TData>;
  /** `true` when the item opens a sub-menu. */
  hasSubmenu: boolean;
}
