import { TectraPreset } from '@tectra/themes';
import { TxGlobalPassThrough, TxPassThroughOptions } from './pass-through.interface';

export type TxThemeMode = 'light' | 'dark';

export interface TxTranslations {
  emptyMessage: string;
  searchPlaceholder: string;
  clear: string;
  selectAll: string;
  close: string;
  loading: string;
  today: string;
  previousPage: string;
  nextPage: string;
  pageReport: string;
}

export interface TxLocaleDefinition {
  code: string;
  intl: string;
  firstDayOfWeek: 0 | 1;
  translations: TxTranslations;
}

export type TxLocaleCode = 'us' | 'ua' | (string & {});

export interface TectraConfig {
  preset: TectraPreset;
  mode?: TxThemeMode;
  darkSelector?: string;
  ripple?: boolean;
  unstyled?: boolean;
  pt?: TxGlobalPassThrough;
  ptOptions?: TxPassThroughOptions;
  locale?: TxLocaleCode | TxLocaleDefinition;
  translations?: Partial<TxTranslations>;
}
