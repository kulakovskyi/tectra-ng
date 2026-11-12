import { Injectable, computed, inject, signal } from '@angular/core';
import { TECTRA_CONFIG, TxLocaleCode, TxLocaleDefinition, TxLocaleRegistry, TxTranslations } from '@tectra-ng/core/config';
import { TxMessageParams, formatMessage } from './format-message';
import { TX_LOCALE_US } from './locales';

@Injectable({ providedIn: 'root' })
export class TxLocaleService {
  private config = inject(TECTRA_CONFIG, { optional: true });
  private registry = inject(TxLocaleRegistry);

  readonly locale = signal<TxLocaleDefinition>(this.resolve(this.config?.locale ?? 'us'));
  readonly translations = computed<TxTranslations>(() => ({ ...this.locale().translations, ...this.config?.translations }));

  constructor() {
    const initial = this.config?.locale;
    if (typeof initial === 'string' && this.locale().code !== initial) {
      void this.setLocale(initial);
    }
  }

  private request = 0;

  async setLocale(locale: TxLocaleCode | TxLocaleDefinition): Promise<void> {
    const request = ++this.request;
    if (typeof locale !== 'string' || locale === TX_LOCALE_US.code || this.registry.get(locale)) {
      this.locale.set(this.resolve(locale));
      return;
    }
    const loaded = await this.registry.load(locale);
    if (request === this.request) {
      this.locale.set(loaded ?? TX_LOCALE_US);
    }
  }

  translate(key: keyof TxTranslations, params: TxMessageParams = {}): string {
    return this.format(this.translations()[key], params);
  }

  format(template: string, params: TxMessageParams = {}): string {
    return formatMessage(template, params, this.locale().intl);
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
    return typeof locale === 'string' ? (this.registry.get(locale) ?? TX_LOCALE_US) : locale;
  }
}
