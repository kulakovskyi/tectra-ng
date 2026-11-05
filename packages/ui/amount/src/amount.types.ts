export type TxAmountPart = 'root' | 'value' | 'currency';

export type TxAmountNotation = 'standard' | 'compact';

export type TxAmountCurrencyDisplay = 'narrowSymbol' | 'symbol' | 'code' | 'name';

export type TxAmountSign = 'positive' | 'negative' | 'zero';

export interface TxAmountSegment {
  text: string;
  currency: boolean;
}

export interface TxAmountFormatOptions {
  locale: string;
  currency?: string | null;
  format?: string;
  notation?: TxAmountNotation;
  currencyDisplay?: TxAmountCurrencyDisplay;
  showSign?: boolean;
}
