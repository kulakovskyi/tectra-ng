import { Pipe, PipeTransform, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { MS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, TxDateInput, calendarDaysBetween, toDate } from '@tectra-ng/utils/date';
import { TxRelativeTimeOptions } from './relative-time.types';

const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;

export function relativeTime(value: TxDateInput, options: TxRelativeTimeOptions = {}): string {
  const date = toDate(value);
  if (!date) {
    return '';
  }
  const now = new Date(options.now ?? Date.now());
  const format = new Intl.RelativeTimeFormat(options.locale ?? 'en-US', { numeric: options.numeric ?? 'auto', style: options.style ?? 'long' });
  const days = calendarDaysBetween(now, date);

  if (options.granularity !== 'day') {
    const seconds = (date.getTime() - now.getTime()) / MS_IN_SECOND;
    const absolute = Math.abs(seconds);
    if (absolute < SECONDS_IN_MINUTE) {
      return format.format(options.numeric === 'always' ? Math.trunc(seconds) : 0, 'second');
    }
    if (absolute < SECONDS_IN_HOUR) {
      return format.format(Math.trunc(seconds / SECONDS_IN_MINUTE), 'minute');
    }
    if (absolute < SECONDS_IN_DAY && days === 0) {
      return format.format(Math.trunc(seconds / SECONDS_IN_HOUR), 'hour');
    }
  }

  const largest = options.largestUnit ?? 'year';
  if (largest === 'day' || Math.abs(days) < DAYS_IN_MONTH) {
    return format.format(days, 'day');
  }
  if (largest === 'month' || Math.abs(days) < DAYS_IN_YEAR) {
    return format.format(Math.trunc(days / DAYS_IN_MONTH), 'month');
  }
  return format.format(Math.trunc(days / DAYS_IN_YEAR), 'year');
}

@Pipe({ name: 'txRelativeTime', pure: false })
export class TxRelativeTimePipe implements PipeTransform {
  private readonly localeService = inject(TxLocaleService);
  private lastKey = '';
  private lastText = '';

  transform(value: TxDateInput, options: TxRelativeTimeOptions = {}): string {
    const locale = options.locale ?? this.localeService.locale().intl;
    const now = options.now ?? Date.now();
    const key = [value instanceof Date ? value.getTime() : value, locale, new Date(now).getTime(), options.granularity, options.largestUnit, options.numeric, options.style].join('|');
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastText = relativeTime(value, { ...options, locale, now });
    }
    return this.lastText;
  }
}
