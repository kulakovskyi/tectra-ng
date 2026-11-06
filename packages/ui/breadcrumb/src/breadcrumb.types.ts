export type TxBreadcrumbPart = 'root' | 'list' | 'item' | 'link' | 'icon' | 'label' | 'separator';

export type TxBreadcrumbSeparator = 'chevron' | 'slash';

export type TxBreadcrumbCommands = string | readonly unknown[];

export interface TxBreadcrumbItemEvent {
  originalEvent: Event;
  item: TxBreadcrumbItem;
}

export interface TxBreadcrumbItem {
  label?: string;
  icon?: string;
  url?: string;
  routerLink?: TxBreadcrumbCommands;
  queryParams?: Record<string, unknown>;
  fragment?: string;
  target?: string;
  disabled?: boolean;
  command?: (event: TxBreadcrumbItemEvent) => void;
  title?: string;
  ariaLabel?: string;
  id?: string;
}

export interface TxBreadcrumbItemContext {
  $implicit: TxBreadcrumbItem;
  current: boolean;
  index: number;
}
