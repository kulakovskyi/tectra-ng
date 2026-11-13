import { Pipe, PipeTransform, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';

/** How `txCurrencySymbol` shows a currency: the short sign, the sign, the ISO code or the full name. */
export type TxCurrencyDisplay = 'narrowSymbol' | 'symbol' | 'code' | 'name';

const cache = new Map<string, string>();

export function currencySymbol(currency: string | null | undefined, locale = 'en-US', display: TxCurrencyDisplay = 'narrowSymbol'): string {
  const code = currency?.trim().toUpperCase();
  if (!code) {
    return '';
  }
  const key = `${code}|${locale}|${display}`;
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  let symbol = code;
  try {
    if (display === 'name') {
      symbol = new Intl.DisplayNames(locale, { type: 'currency' }).of(code) ?? code;
    } else {
      const parts = new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: display }).formatToParts(0);
      symbol = parts.find((part) => part.type === 'currency')?.value ?? code;
    }
  } catch {
    symbol = code;
  }
  cache.set(key, symbol);
  return symbol;
}

@Pipe({ name: 'txCurrencySymbol', pure: false })
export class TxCurrencySymbolPipe implements PipeTransform {
  private readonly localeService = inject(TxLocaleService);

  transform(currency: string | null | undefined, display: TxCurrencyDisplay = 'narrowSymbol', locale?: string): string {
    return currencySymbol(currency, locale ?? this.localeService.locale().intl, display);
  }
}
