import { InjectionToken, Provider } from '@angular/core';
import { TX_DATE_STYLES } from './date.constants';
import { TxDateFormatConfig } from './date.types';

/** Default date format settings: a medium date in the tectra locale, `-` for an empty value, the local time zone. */
export const TX_DATE_FORMAT_DEFAULTS: TxDateFormatConfig = {
  format: TX_DATE_STYLES.date,
  empty: '-',
  locale: undefined,
  timezone: undefined,
};

/** Date format settings used by the `txDate` pipe; set them with `provideTxDateFormat`. */
export const TX_DATE_FORMAT_CONFIG = new InjectionToken<TxDateFormatConfig>('TX_DATE_FORMAT_CONFIG', {
  providedIn: 'root',
  factory: () => TX_DATE_FORMAT_DEFAULTS,
});

export function provideTxDateFormat(config: Partial<TxDateFormatConfig>): Provider {
  return { provide: TX_DATE_FORMAT_CONFIG, useValue: { ...TX_DATE_FORMAT_DEFAULTS, ...config } };
}
