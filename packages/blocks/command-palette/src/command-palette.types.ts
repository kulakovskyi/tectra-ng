import { TxIconName } from '@tectra-ng/icons';

/** One entry of `tx-command-palette`: a page to open or a command to run. */
export interface TxCommandPaletteItem {
  /** Unique id of the entry. */
  id: string;
  /** Group the entry is listed under; its title comes from `groupLabels`. */
  group: string;
  /** Main text of the entry. */
  label: string;
  /** Smaller text after the label, such as the section of a page. */
  sublabel?: string;
  /** Name of the icon before the label. */
  icon?: TxIconName | (string & {});
  /** Router link to open when the entry is picked. */
  routerLink?: string | readonly unknown[];
  /** Query parameters of the router link. */
  queryParams?: Record<string, unknown>;
  /** Function to run when the entry is picked. */
  command?: () => void;
}

/** Names of the parts of `tx-command-palette` that its `pt` input can style. */
export type TxCommandPalettePart = 'root' | 'trigger' | 'overlay' | 'panel' | 'search' | 'results' | 'item' | 'footer';
