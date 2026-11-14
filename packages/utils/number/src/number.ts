import { Pipe, PipeTransform, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';

/** Options of `txNumber` and `formatLocaleNumber`: `Intl.NumberFormat` options with a locale and an empty text. */
export interface TxNumberOptions extends Intl.NumberFormatOptions {
  /** Locale of the format (default `en-US`; the pipe uses the tectra locale). */
  locale?: string;
  /** Text shown for a missing or non-numeric value (default `-`). */
  empty?: string;
}

/** Anything `txNumber` accepts: a number, a numeric string, a bigint, or nothing. */
export type TxNumberInput = number | bigint | string | null | undefined;

export function formatLocaleNumber(value: TxNumberInput, options: TxNumberOptions = {}): string {
  const { locale = 'en-US', empty = '-', ...format } = options;
  const number = typeof value === 'string' ? (value.trim() === '' ? Number.NaN : Number(value)) : value;
  if (number === null || number === undefined || (typeof number === 'number' && !Number.isFinite(number))) {
    return empty;
  }
  try {
    return new Intl.NumberFormat(locale, format).format(number);
  } catch {
    return empty;
  }
}

@Pipe({ name: 'txNumber', pure: false })
export class TxNumberPipe implements PipeTransform {
  private readonly localeService = inject(TxLocaleService);
  private lastKey = '';
  private lastText = '';

  transform(value: TxNumberInput, options: TxNumberOptions = {}): string {
    const locale = options.locale ?? this.localeService.locale().intl;
    const key = `${typeof value}|${String(value)}|${locale}|${JSON.stringify(options)}`;
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastText = formatLocaleNumber(value, { ...options, locale });
    }
    return this.lastText;
  }
}
