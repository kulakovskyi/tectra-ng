import { TectraPreset } from '@tectra/themes';
import { TxGlobalPassThrough, TxPassThroughOptions } from './pass-through.interface';

export type TxThemeMode = 'light' | 'dark';

export interface TectraConfig {
  preset: TectraPreset;
  mode?: TxThemeMode;
  darkSelector?: string;
  ripple?: boolean;
  unstyled?: boolean;
  pt?: TxGlobalPassThrough;
  ptOptions?: TxPassThroughOptions;
  translations?: Partial<TxTranslations>;
}

export interface TxTranslations {
  emptyMessage: string;
  searchPlaceholder: string;
}
