/** Names of the parts of `tx-breadcrumb` that `pt` can style. */
export type TxBreadcrumbPart = 'root' | 'list' | 'item' | 'link' | 'text' | 'icon' | 'label' | 'separator';

/** Mark between items: `chevron` or `slash`. */
export type TxBreadcrumbSeparator = 'chevron' | 'slash';

/** Router link target: a path string or a list of commands. */
export type TxBreadcrumbCommands = string | readonly unknown[];

/** Payload of a click on an item and of its `command`. */
export interface TxBreadcrumbItemEvent {
  /** The DOM event of the click. */
  originalEvent: Event;
  /** The clicked item. */
  item: TxBreadcrumbItem;
}

/** One step of the path: a label or icon and where it leads. */
export interface TxBreadcrumbItem {
  /** Text of the item. */
  label?: string;
  /** Icon name, or a CSS class, shown before the label. */
  icon?: string;
  /** Address of a plain link. */
  url?: string;
  /** Router commands to navigate to; needs the Angular router. */
  routerLink?: TxBreadcrumbCommands;
  /** Query parameters of the router link. */
  queryParams?: Record<string, unknown>;
  /** Fragment of the router link. */
  fragment?: string;
  /** Link target such as `_blank`. */
  target?: string;
  /** Shows the item dimmed and not clickable. */
  disabled?: boolean;
  /** Called on click; an item with only a command is a button. */
  command?: (event: TxBreadcrumbItemEvent) => void;
  /** Tooltip of the item. */
  title?: string;
  /** Accessible name; needed for an icon-only item. */
  ariaLabel?: string;
  /** Element id of the item. */
  id?: string;
}

/** Context of the `txBreadcrumbItem` template. */
export interface TxBreadcrumbItemContext {
  /** The item, so `let-item` works. */
  $implicit: TxBreadcrumbItem;
  /** Whether this is the last item, the current page. */
  current: boolean;
  /** Position of the item, the home item counting as 0. */
  index: number;
}
