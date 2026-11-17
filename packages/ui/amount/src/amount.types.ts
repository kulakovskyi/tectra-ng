/** Names of the parts of `tx-amount` that `pt` can style. */
export type TxAmountPart = 'root' | 'value' | 'currency';

/** How large numbers are written: in full (`standard`) or shortened like 1.2K (`compact`). */
export type TxAmountNotation = 'standard' | 'compact';

/** How the currency is written: narrow symbol, symbol, ISO code or full name. */
export type TxAmountCurrencyDisplay = 'narrowSymbol' | 'symbol' | 'code' | 'name';

/** Where the currency goes: `auto` as the locale writes it, `before` or `after` the number. */
export type TxAmountSymbolPosition = 'auto' | 'before' | 'after';

/** Own currency texts by ISO or custom code, such as `{ USDT: '₮', UAH: 'грн' }`. */
export type TxAmountSymbols = Readonly<Record<string, string>>;

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
  /**
   * Digits info like `1.2-2`: minimum integer digits, then minimum and maximum fraction digits. Without it a currency
   * shows its own minor digits (`$318.60`, `¥318`) and a plain number up to two decimals.
   */
  format?: string;
  /** Standard or compact notation (default `standard`). */
  notation?: TxAmountNotation;
  /** How the currency is written (default `narrowSymbol`). */
  currencyDisplay?: TxAmountCurrencyDisplay;
  /** Writes `+` before positive amounts (default off). */
  showSign?: boolean;
  /** Where the currency goes (default `auto`: as the locale writes it). */
  symbolPosition?: TxAmountSymbolPosition;
  /** Own currency texts by code; a code found here is written with its own text instead of the `Intl` one. */
  symbols?: TxAmountSymbols;
}

/** App-wide defaults of every `tx-amount`; set them with `provideTxAmount`. */
export interface TxAmountOptions {
  /** `Intl` locale of the numbers, such as `en-US`, apart from the language of the interface; the tectra locale when not set. */
  locale?: string;
  /** Where the currency goes (default `auto`). */
  symbolPosition?: TxAmountSymbolPosition;
  /** Own currency texts by code, such as `{ USDT: 'USDT', BTC: '₿' }`. */
  symbols?: TxAmountSymbols;
}
