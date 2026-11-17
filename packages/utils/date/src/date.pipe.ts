import { Pipe, PipeTransform, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TX_DATE_FORMAT_CONFIG } from './date.config';
import { formatTxDate } from './date.format';
import { toDate, toIsoRange } from './date.functions';
import { TxDateFormat, TxDateInput, TxIsoRange } from './date.types';

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
      this.lastText = formatTxDate(date, pattern, {
        locale: activeLocale,
        timezone: zone,
        empty: this.config.empty,
        fallbackLocale: fixedLocale === undefined ? undefined : null,
      });
    }
    return this.lastText;
  }
}

@Pipe({ name: 'txDateRange' })
export class TxDateRangePipe implements PipeTransform {
  transform(range: readonly TxDateInput[] | null | undefined): TxIsoRange | null {
    return toIsoRange(range);
  }
}
