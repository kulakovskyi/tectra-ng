import { formatDate } from '@angular/common';
import { MINUTES_IN_HOUR, MS_IN_MINUTE, TX_DATE_STYLES } from './date.constants';
import { toDate } from './date.functions';
import { TxDateFormat, TxDateFormatOptions, TxDateInput } from './date.types';

const DEFAULT_LOCALE = 'en-US';
const OFFSET = /^(?:UTC|GMT)?([+-])(\d{2}):?(\d{2})$/;

function formatIntl(date: Date, options: Intl.DateTimeFormatOptions, locale: string, timezone?: string): string {
  const offset = timezone ? OFFSET.exec(timezone) : null;
  if (offset) {
    const minutes = (Number(offset[2]) * MINUTES_IN_HOUR + Number(offset[3])) * (offset[1] === '-' ? -1 : 1);
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(new Date(date.getTime() + minutes * MS_IN_MINUTE));
  }
  return new Intl.DateTimeFormat(locale, timezone ? { ...options, timeZone: timezone } : options).format(date);
}

function formatPattern(date: Date, pattern: string, locale: string, timezone: string | undefined, fallbackLocale: string | null): string {
  try {
    return formatDate(date, pattern, locale, timezone);
  } catch (error) {
    if (!fallbackLocale || locale === fallbackLocale) {
      throw error;
    }
    return formatDate(date, pattern, fallbackLocale, timezone);
  }
}

/**
 * Formats a date by the rules of the `txDate` pipe, without dependency injection: usable in services, workers, tests and plain functions.
 *
 * `format` is `Intl.DateTimeFormat` options (`TX_DATE_STYLES.dateTime`) or an Angular date pattern (`'dd.MM.yyyy'`, `'mediumDate'`);
 * a medium date when not set. Returns `options.empty` (`-`) for an empty or invalid value, and when the format or time zone fails.
 *
 * @example formatTxDate(order.paidAt, TX_DATE_STYLES.dateTime, { locale: 'uk-UA', timezone: 'Europe/Kyiv' })
 */
export function formatTxDate(value: TxDateInput, format?: TxDateFormat, options: TxDateFormatOptions = {}): string {
  const empty = options.empty ?? '-';
  const date = toDate(value);
  if (!date) {
    return empty;
  }
  const pattern = format ?? TX_DATE_STYLES.date;
  const locale = options.locale ?? DEFAULT_LOCALE;
  const fallbackLocale = options.fallbackLocale === undefined ? DEFAULT_LOCALE : options.fallbackLocale;
  try {
    if (typeof pattern !== 'string') {
      return formatIntl(date, pattern, locale, options.timezone);
    }
    return formatPattern(date, pattern, locale, options.timezone, fallbackLocale) || empty;
  } catch {
    return empty;
  }
}
