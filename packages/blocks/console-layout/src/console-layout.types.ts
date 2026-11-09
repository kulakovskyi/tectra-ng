import { IsActiveMatchOptions } from '@angular/router';
import { TxIconName } from '@tectra-ng/icons';

export interface TxConsoleRailItem {
  label: string;
  icon: TxIconName | (string & {});
  routerLink?: string | readonly unknown[];
  queryParams?: Record<string, unknown>;
  activeOptions?: IsActiveMatchOptions;
  url?: string;
  target?: string;
  command?: () => void;
  active?: boolean;
}

export type TxConsoleResponsive = 'viewport' | 'container';

export type TxConsoleTranslate = (key: string) => string;

export type TxConsoleLayoutPart = 'root' | 'header' | 'brand' | 'logo' | 'crumbs' | 'rail' | 'content' | 'footer';

export type TxConsolePanelPart = 'root' | 'aside' | 'toggle' | 'nav' | 'main' | 'content';
