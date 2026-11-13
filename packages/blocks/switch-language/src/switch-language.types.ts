import { TxLocaleCode } from '@tectra-ng/core/config';

/** One language of `tx-switch-language`. */
export interface TxLanguageOption {
  /** Locale code, such as `us`. */
  code: TxLocaleCode;
  /** Full name in its own language. */
  name: string;
  /** Short label on the switch, such as `EN`. */
  short: string;
}

/** Names of the parts of `tx-switch-language` that its `pt` input can style. */
export type TxSwitchLanguagePart = 'root' | 'group' | 'thumb' | 'option';

/** Languages `tx-switch-language` offers by default: English and Ukrainian. */
export const TX_LANGUAGES: readonly TxLanguageOption[] = [
  { code: 'us', name: 'English', short: 'EN' },
  { code: 'ua', name: 'Українська', short: 'UA' },
];
