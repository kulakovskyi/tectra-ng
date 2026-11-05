import { TectraPreset } from '@tectra/themes';

export type TxThemeMode = 'light' | 'dark';

export interface TectraConfig {
  preset: TectraPreset;
  mode?: TxThemeMode;
  translations?: Partial<TxTranslations>;
}

export interface TxTranslations {
  emptyMessage: string;
  searchPlaceholder: string;
}
