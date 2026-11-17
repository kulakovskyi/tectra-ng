import { InjectionToken, Provider } from '@angular/core';
import { TxAmountOptions } from './amount.types';

/** App-wide defaults of every `tx-amount`; set them with `provideTxAmount`. */
export const TX_AMOUNT_OPTIONS = new InjectionToken<TxAmountOptions>('TX_AMOUNT_OPTIONS');

/**
 * Sets app-wide defaults of every `tx-amount`: the number locale, where the currency goes and own currency texts,
 * e.g. `provideTxAmount({ locale: 'uk-UA', symbolPosition: 'after', symbols: { USDT: 'USDT' } })`.
 */
export function provideTxAmount(options: TxAmountOptions): Provider {
  return { provide: TX_AMOUNT_OPTIONS, useValue: options };
}
