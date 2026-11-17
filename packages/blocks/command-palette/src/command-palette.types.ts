import { TxIconName } from '@tectra-ng/icons';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

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

/** Maps the icon of a menu item to a palette icon: `{ 'old-name': 'new-name' }` or a function of the item. */
export type TxMenuPaletteIcon = Readonly<Record<string, string>> | ((item: TxPanelMenuItem) => string | null | undefined);

/** Options of `menuPaletteItems`. */
export interface TxMenuPaletteOptions {
  /** Group of the items, `pages` by default. */
  group?: string;
  /** Turns a menu label into the shown text, for menus whose labels are translation keys; section and parent titles too. */
  translate?: (key: string) => string;
  /** Maps the icon of a menu item to the icon shown in the palette; an icon it does not map stays as it is. */
  icon?: TxMenuPaletteIcon;
  /** Icon of an entry whose menu item has none, `file` by default. */
  defaultIcon?: TxIconName | (string & {});
}
