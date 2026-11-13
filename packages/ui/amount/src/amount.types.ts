/** Names of the parts of `tx-amount` that `pt` can style. */
export type TxAmountPart = 'root' | 'value' | 'currency';

/** How large numbers are written: in full (`standard`) or shortened like 1.2K (`compact`). */
export type TxAmountNotation = 'standard' | 'compact';

/** How the currency is written: narrow symbol, symbol, ISO code or full name. */
export type TxAmountCurrencyDisplay = 'narrowSymbol' | 'symbol' | 'code' | 'name';

/** Sign of an amount: `positive`, `negative` or `zero`. */
export type TxAmountSign = 'positive' | 'negative' | 'zero';

/** One piece of a formatted amount: the currency part or the number part. */
export interface TxAmountSegment {
  /** Text of the piece. */
  text: string;
  /** Whether the piece is the currency symbol, code or name. */
  currency: boolean;
}

/** Options for `formatAmount`: locale, currency, digits and sign. */
export interface TxAmountFormatOptions {
  /** Locale used to format the number, such as `en-US`. */
  locale: string;
  /** ISO currency code; without it the plain number is formatted. */
  currency?: string | null;
  /** Digits info like `1.2-2`: minimum integer digits, then minimum and maximum fraction digits. */
  format?: string;
  /** Standard or compact notation (default `standard`). */
  notation?: TxAmountNotation;
  /** How the currency is written (default `narrowSymbol`). */
  currencyDisplay?: TxAmountCurrencyDisplay;
  /** Writes `+` before positive amounts (default off). */
  showSign?: boolean;
}
