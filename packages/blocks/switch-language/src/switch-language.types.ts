import { TxLocaleCode } from '@tectra-ng/core/config';

export interface TxLanguageOption {
  code: TxLocaleCode;
  name: string;
  short: string;
}

export type TxSwitchLanguagePart = 'root' | 'group' | 'thumb' | 'option';

export const TX_LANGUAGES: readonly TxLanguageOption[] = [
  { code: 'us', name: 'English', short: 'EN' },
  { code: 'ua', name: 'Українська', short: 'UA' },
];
