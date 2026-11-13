import { Injectable, computed, inject, signal } from '@angular/core';
import { TECTRA_CONFIG, TxLocaleCode, TxLocaleDefinition, TxLocaleRegistry, TxTranslations } from '@tectra-ng/core/config';
import { TxMessageParams, formatMessage } from './format-message';
import { TX_LOCALE_US } from './locales';

/** Holds the current locale and translates, formats numbers and dates for it; the `locale` config option sets the start locale. */
@Injectable({ providedIn: 'root' })
export class TxLocaleService {
  private config = inject(TECTRA_CONFIG, { optional: true });
  private registry = inject(TxLocaleRegistry);

  /** The current locale definition. */
  readonly locale = signal<TxLocaleDefinition>(this.resolve(this.config?.locale ?? 'us'));
  /** Translations of the current locale with the `translations` overrides of the config on top. */
  readonly translations = computed<TxTranslations>(() => ({ ...this.locale().translations, ...this.config?.translations }));

  constructor() {
    const initial = this.config?.locale;
    if (typeof initial === 'string' && this.locale().code !== initial) {
      void this.setLocale(initial);
    }
  }

  private request = 0;

  /** Switches the locale by code or definition; a code that is not registered yet is loaded first, and `us` is used if it fails. */
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

  /** Returns the text of a translation key with its parameters filled in. */
  translate(key: keyof TxTranslations, params: TxMessageParams = {}): string {
    return this.format(this.translations()[key], params);
  }

  /** Fills the placeholders and plural forms of a template for the current locale. */
  format(template: string, params: TxMessageParams = {}): string {
    return formatMessage(template, params, this.locale().intl);
  }

  /** Formats a number with `Intl.NumberFormat` for the current locale. */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale().intl, options).format(value);
  }

  /** Formats a date or timestamp with `Intl.DateTimeFormat` for the current locale. */
  formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale().intl, options).format(value);
  }

  /** The twelve month names, January first, in the current locale. */
  monthNames(style: 'long' | 'short' = 'long'): string[] {
    const format = new Intl.DateTimeFormat(this.locale().intl, { month: style });
    return Array.from({ length: 12 }, (_, month) => format.format(new Date(2024, month, 1)));
  }

  /** The seven weekday names in the current locale, starting at its first day of the week. */
  weekdayNames(style: 'long' | 'short' | 'narrow' = 'short'): string[] {
    const format = new Intl.DateTimeFormat(this.locale().intl, { weekday: style });
    const first = this.locale().firstDayOfWeek;
    return Array.from({ length: 7 }, (_, day) => format.format(new Date(2024, 0, 7 + ((day + first) % 7))));
  }

  private resolve(locale: TxLocaleCode | TxLocaleDefinition): TxLocaleDefinition {
    return typeof locale === 'string' ? (this.registry.get(locale) ?? TX_LOCALE_US) : locale;
  }
}
