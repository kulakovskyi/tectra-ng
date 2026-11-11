import { formatDate } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { TX_DATE_FORMAT_CONFIG } from './date.config';
import { toDate, toIsoRange } from './date.functions';
import { TxDateInput, TxIsoRange } from './date.types';

@Pipe({ name: 'txDate' })
export class TxDatePipe implements PipeTransform {
  private readonly config = inject(TX_DATE_FORMAT_CONFIG);

  transform(value: TxDateInput, format?: string, timezone?: string, locale?: string): string {
    const date = toDate(value);
    if (!date) {
      return this.config.empty;
    }
    try {
      return formatDate(date, format ?? this.config.format, locale ?? this.config.locale, timezone ?? this.config.timezone) || this.config.empty;
    } catch {
      return this.config.empty;
    }
  }
}

@Pipe({ name: 'txDateRange' })
export class TxDateRangePipe implements PipeTransform {
  transform(range: readonly TxDateInput[] | null | undefined): TxIsoRange | null {
    return toIsoRange(range);
  }
}
