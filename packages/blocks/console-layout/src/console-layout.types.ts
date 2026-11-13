import { IsActiveMatchOptions } from '@angular/router';
import { TxIconName } from '@tectra-ng/icons';

/** One section on the rail of `tx-console-layout`: a router link, a plain URL or a command. */
export interface TxConsoleRailItem {
  /** Text under the icon. */
  label: string;
  /** Name of the icon. */
  icon: TxIconName | (string & {});
  /** Router link of the section. */
  routerLink?: string | readonly unknown[];
  /** Query parameters of the router link. */
  queryParams?: Record<string, unknown>;
  /** When the router link counts as active (default `TX_CONSOLE_RAIL_EXACT_MATCH`). */
  activeOptions?: IsActiveMatchOptions;
  /** Plain address, used when there is no router link. */
  url?: string;
  /** Link target, such as `_blank`. */
  target?: string;
  /** Function to run on click, for a section that is not a link. */
  command?: () => void;
  /** Marks the section active; for items with a URL or a command, which the router cannot match. */
  active?: boolean;
}

/** What the console breakpoints measure: the `viewport` (window) or the `container` (the console itself). */
export type TxConsoleResponsive = 'viewport' | 'container';

/** A function that turns a key, such as a crumb or a rail label, into the shown text. */
export type TxConsoleTranslate = (key: string) => string;

/** Names of the parts of `tx-console-layout` that its `pt` input can style. */
export type TxConsoleLayoutPart = 'root' | 'header' | 'brand' | 'logo' | 'crumbs' | 'rail' | 'content' | 'footer';

/** Names of the parts of `tx-console-panel` that its `pt` input can style. */
export type TxConsolePanelPart = 'root' | 'aside' | 'toggle' | 'nav' | 'main' | 'content';
