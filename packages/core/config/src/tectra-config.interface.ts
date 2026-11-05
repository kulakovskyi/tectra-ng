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
  copy: string;
  copied: string;
  validationRequired: string;
  validationEmail: string;
  validationMinlength: string;
  validationMaxlength: string;
  validationMin: string;
  validationMax: string;
  validationPattern: string;
  validationInvalid: string;
  passwordPrompt: string;
  passwordWeak: string;
  passwordMedium: string;
  passwordStrong: string;
  showPassword: string;
  hidePassword: string;
  otpCell: string;
  increment: string;
  decrement: string;
  ratingValue: string;
  rangeStart: string;
  rangeEnd: string;
  generatePassword: string;
  remove: string;
  moreItems: string;
  selectedItems: string;
  selectedOfTotal: string;
  showOptions: string;
  removeItem: string;
  itemsLimit: string;
  pickColor: string;
  noColor: string;
  colorArea: string;
  colorAreaValue: string;
  colorHue: string;
  colorHex: string;
  colorPresets: string;
  useEmail: string;
  didYouMean: string;
  yes: string;
  no: string;
  copyLink: string;
  copyEmail: string;
  copyPhone: string;
  opensInNewTab: string;
}

export type TxValidationMessage = string | ((error: unknown) => string);
export type TxValidationMessages = Record<string, TxValidationMessage>;

export interface TxLocaleDefinition {
  code: string;
  intl: string;
  firstDayOfWeek: 0 | 1;
  translations: TxTranslations;
}

export type TxLocaleCode = 'us' | 'ua' | (string & {});

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
  translations?: Partial<TxTranslations>;
  overlay?: TxOverlayConfig;
  validationMessages?: TxValidationMessages;
}
