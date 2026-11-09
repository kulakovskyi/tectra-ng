import { TxIconName } from '@tectra-ng/icons';

export interface TxCommandPaletteItem {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  icon?: TxIconName | (string & {});
  routerLink?: string | readonly unknown[];
  queryParams?: Record<string, unknown>;
  command?: () => void;
}

export type TxCommandPaletteTranslate = (key: string) => string;

export type TxCommandPalettePart = 'root' | 'trigger' | 'overlay' | 'panel' | 'search' | 'results' | 'item' | 'footer';
