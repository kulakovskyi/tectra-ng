import { Injectable, computed, inject, signal } from '@angular/core';
import { TECTRA_CONFIG, TxLocaleCode, TxLocaleDefinition, TxTranslations } from '@tectra-ng/core/config';
import { TX_LOCALES, TX_LOCALE_US } from './locales';

@Injectable({ providedIn: 'root' })
export class TxLocaleService {
  private config = inject(TECTRA_CONFIG, { optional: true });

  readonly locale = signal<TxLocaleDefinition>(this.resolve(this.config?.locale ?? 'us'));
  readonly translations = computed<TxTranslations>(() => ({ ...this.locale().translations, ...this.config?.translations }));

  setLocale(locale: TxLocaleCode | TxLocaleDefinition): void {
    this.locale.set(this.resolve(locale));
  }

  translate(key: keyof TxTranslations, params: Record<string, string | number> = {}): string {
    return this.translations()[key].replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match));
  }

  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale().intl, options).format(value);
  }

  formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale().intl, options).format(value);
  }

  monthNames(style: 'long' | 'short' = 'long'): string[] {
    const format = new Intl.DateTimeFormat(this.locale().intl, { month: style });
    return Array.from({ length: 12 }, (_, month) => format.format(new Date(2024, month, 1)));
  }

  weekdayNames(style: 'long' | 'short' | 'narrow' = 'short'): string[] {
    const format = new Intl.DateTimeFormat(this.locale().intl, { weekday: style });
    const first = this.locale().firstDayOfWeek;
    return Array.from({ length: 7 }, (_, day) => format.format(new Date(2024, 0, 7 + ((day + first) % 7))));
  }

  private resolve(locale: TxLocaleCode | TxLocaleDefinition): TxLocaleDefinition {
    return typeof locale === 'string' ? (TX_LOCALES[locale] ?? TX_LOCALE_US) : locale;
  }
}
