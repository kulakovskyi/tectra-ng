import { InjectionToken, Provider } from '@angular/core';
import { TxDateFormatConfig } from './date.types';

export const TX_DATE_FORMAT_DEFAULTS: TxDateFormatConfig = {
  format: 'mediumDate',
  empty: '-',
  locale: 'en-US',
  timezone: undefined,
};

export const TX_DATE_FORMAT_CONFIG = new InjectionToken<TxDateFormatConfig>('TX_DATE_FORMAT_CONFIG', {
  providedIn: 'root',
  factory: () => TX_DATE_FORMAT_DEFAULTS,
});

export function provideTxDateFormat(config: Partial<TxDateFormatConfig>): Provider {
  return { provide: TX_DATE_FORMAT_CONFIG, useValue: { ...TX_DATE_FORMAT_DEFAULTS, ...config } };
}
