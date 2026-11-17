/** One country offered by `tx-country-select`. */
export interface TxCountryOption {
  /** ISO 3166-1 alpha-2 code, in any case; other text (`none`, `other`) makes a row without a flag. */
  code: string;
  /** Value written to the model; when not set, the upper-case country code, or other text as it is. */
  value?: string;
  /** Name shown for the country; the localized name when not set. */
  label?: string;
  /** Number shown at the end of the row. */
  count?: number;
  /** Small text shown in the row after the name. */
  hint?: string;
  /** Stops the country from being picked. */
  disabled?: boolean;
  /** Draws the flag; on for country and region codes, off for any other code, which shows only its label. */
  flag?: boolean;
}

/** A country option with every default filled in, as the list renders it. */
export interface TxCountryItem {
  /** Upper-case country code, or other text as it is. */
  code: string;
  /** Value written to the model. */
  value: string;
  /** Name shown for the country. */
  label: string;
  /** Number shown at the end of the row, or `null`. */
  count: number | null;
  /** Small text shown after the name; empty for none. */
  hint: string;
  /** Whether the country cannot be picked. */
  disabled: boolean;
  /** Whether the row draws a flag; a row without one shows only its label. */
  flag: boolean;
}

/** How the list is ordered: `name` by the localized name, or `none` to keep the order of `options`. */
export type TxCountrySort = 'name' | 'none';
