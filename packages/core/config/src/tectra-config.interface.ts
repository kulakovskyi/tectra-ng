import { TectraPreset } from '@tectra-ng/themes';
import { TxLocaleCode, TxLocaleDefinition, TxTranslations } from '@tectra-ng/core/i18n/types';
import { TxGlobalPassThrough, TxPassThroughOptions } from './pass-through.interface';

export type { TxLocaleCode, TxLocaleDefinition, TxTranslations };

export type TxThemeMode = 'light' | 'dark';

export type TxValidationMessage = string | ((error: unknown) => string);
export type TxValidationMessages = Record<string, TxValidationMessage>;

export interface TxViewportInsets {
  top?: number;
  bottom?: number;
}

export interface TxOverlayConfig {
  viewportInsets?: TxViewportInsets;
}

export interface TectraConfig {
  preset: TectraPreset;
  mode?: TxThemeMode;
  darkSelector?: string;
  ripple?: boolean;
  unstyled?: boolean;
  pt?: TxGlobalPassThrough;
  ptOptions?: TxPassThroughOptions;
  locale?: TxLocaleCode | TxLocaleDefinition;
  locales?: TxLocaleDefinition[];
  translations?: Partial<TxTranslations>;
  overlay?: TxOverlayConfig;
  validationMessages?: TxValidationMessages;
}
