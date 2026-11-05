import { TemplateRef } from '@angular/core';

export type TxMenuItemSeverity = 'danger';
export type TxMenuIconSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
export type TxMenuPart = 'root' | 'item' | 'icon' | 'label' | 'shortcut' | 'badge' | 'separator' | 'groupLabel' | 'submenuIcon';

export interface TxMenuItemEvent<TData = unknown> {
  item: TxMenuItem<TData>;
  originalEvent: Event;
}

export interface TxMenuItem<TData = unknown> {
  id?: string;
  label?: string;
  icon?: string;
  iconSeverity?: TxMenuIconSeverity;
  command?: (event: TxMenuItemEvent<TData>) => void;
  routerLink?: string | readonly unknown[];
  queryParams?: Record<string, unknown>;
  fragment?: string;
  url?: string;
  target?: string;
  disabled?: boolean;
  visible?: boolean;
  separator?: boolean;
  severity?: TxMenuItemSeverity;
  badge?: string | number;
  shortcut?: string;
  title?: string;
  items?: TxMenuItem<TData>[];
  data?: TData;
}

export interface TxMenuItemContext<TData = unknown> {
  $implicit: TxMenuItem<TData>;
  hasSubmenu: boolean;
}

export interface TxMenuListOptions {
  tiered: boolean;
  itemTemplate: TemplateRef<TxMenuItemContext> | null;
  unstyled: boolean;
}
