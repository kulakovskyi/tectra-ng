import { formatDate } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TX_DATE_FORMAT_CONFIG } from './date.config';
import { MS_IN_MINUTE, MINUTES_IN_HOUR } from './date.constants';
import { toDate, toIsoRange } from './date.functions';
import { TxDateFormat, TxDateInput, TxIsoRange } from './date.types';

const FALLBACK_LOCALE = 'en-US';
const OFFSET = /^(?:UTC|GMT)?([+-])(\d{2}):?(\d{2})$/;

function formatDateIntl(date: Date, options: Intl.DateTimeFormatOptions, locale: string, timezone?: string): string {
  const offset = timezone ? OFFSET.exec(timezone) : null;
  if (offset) {
    const minutes = (Number(offset[2]) * MINUTES_IN_HOUR + Number(offset[3])) * (offset[1] === '-' ? -1 : 1);
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(new Date(date.getTime() + minutes * MS_IN_MINUTE));
  }
  return new Intl.DateTimeFormat(locale, timezone ? { ...options, timeZone: timezone } : options).format(date);
}

@Pipe({ name: 'txDate', pure: false })
export class TxDatePipe implements PipeTransform {
  private readonly config = inject(TX_DATE_FORMAT_CONFIG);
  private readonly localeService = inject(TxLocaleService);
  private lastKey = '';
  private lastText = '';

  transform(value: TxDateInput, format?: TxDateFormat, timezone?: string, locale?: string): string {
    const date = toDate(value);
    if (!date) {
      return this.config.empty;
    }
    const pattern = format ?? this.config.format;
    const zone = timezone ?? this.config.timezone;
    const fixedLocale = locale ?? this.config.locale;
    const activeLocale = fixedLocale ?? this.localeService.locale().intl;
    const key = [date.getTime(), typeof pattern === 'string' ? pattern : JSON.stringify(pattern), zone, activeLocale, fixedLocale === undefined].join('|');
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastText = this.format(date, pattern, zone, activeLocale, fixedLocale === undefined);
    }
    return this.lastText;
  }

  private format(date: Date, pattern: TxDateFormat, timezone: string | undefined, locale: string, followsActive: boolean): string {
    try {
      if (typeof pattern !== 'string') {
        return formatDateIntl(date, pattern, locale, timezone);
      }
      return this.formatPattern(date, pattern, timezone, locale, followsActive) || this.config.empty;
    } catch {
      return this.config.empty;
    }
  }

  private formatPattern(date: Date, pattern: string, timezone: string | undefined, locale: string, followsActive: boolean): string {
    try {
      return formatDate(date, pattern, locale, timezone);
    } catch (error) {
      if (!followsActive || locale === FALLBACK_LOCALE) {
        throw error;
      }
      return formatDate(date, pattern, FALLBACK_LOCALE, timezone);
    }
  }
}

@Pipe({ name: 'txDateRange' })
export class TxDateRangePipe implements PipeTransform {
  transform(range: readonly TxDateInput[] | null | undefined): TxIsoRange | null {
    return toIsoRange(range);
  }
}
