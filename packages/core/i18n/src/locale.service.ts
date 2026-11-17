import { Injectable, computed, inject, signal } from '@angular/core';
import {
  TECTRA_CONFIG,
  TX_LOCALE_LOADERS,
  TxLocaleCode,
  TxLocaleDefinition,
  TxLocaleRegistry,
  TxLocaleStorage,
  TxTranslations,
} from '@tectra-ng/core/config';
import { TxMessageParams, formatMessage } from './format-message';
import { TX_LOCALE_US } from './locales';

/**
 * Holds the current locale and translates, formats numbers and dates for it; the `locale` config option sets the start
 * locale, and a locale remembered under `localeStorageKey` takes its place.
 */
@Injectable({ providedIn: 'root' })
export class TxLocaleService {
  private config = inject(TECTRA_CONFIG, { optional: true });
  private registry = inject(TxLocaleRegistry);
  private storage = inject(TxLocaleStorage);
  private readonly start = this.startLocale();

  /** The current locale definition. */
  readonly locale = signal<TxLocaleDefinition>(this.resolve(this.start));
  /** Translations of the current locale with the `translations` overrides of the config on top. */
  readonly translations = computed<TxTranslations>(() => ({ ...this.locale().translations, ...this.config?.translations }));

  constructor() {
    const initial = this.start;
    if (typeof initial === 'string' && this.locale().code !== initial) {
      void this.apply(initial);
    }
  }

  private request = 0;

  /**
   * Switches the locale by code or definition; a code that is not registered yet is loaded first, and `us` is used if
   * it fails. The code of the applied locale is remembered under `localeStorageKey`.
   */
  async setLocale(locale: TxLocaleCode | TxLocaleDefinition): Promise<void> {
    const request = await this.apply(locale);
    if (request === this.request) {
      this.storage.write(this.locale().code);
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

  private async apply(locale: TxLocaleCode | TxLocaleDefinition): Promise<number> {
    const request = ++this.request;
    if (typeof locale !== 'string' || locale === TX_LOCALE_US.code || this.registry.get(locale)) {
      this.locale.set(this.resolve(locale));
      return request;
    }
    const loaded = await this.registry.load(locale);
    if (request === this.request) {
      this.locale.set(loaded ?? TX_LOCALE_US);
    }
    return request;
  }

  private startLocale(): TxLocaleCode | TxLocaleDefinition {
    const stored = this.storage.read();
    if (stored && (stored === TX_LOCALE_US.code || this.registry.get(stored) || stored in TX_LOCALE_LOADERS)) {
      return stored;
    }
    return this.config?.locale ?? TX_LOCALE_US.code;
  }

  private resolve(locale: TxLocaleCode | TxLocaleDefinition): TxLocaleDefinition {
    return typeof locale === 'string' ? (this.registry.get(locale) ?? TX_LOCALE_US) : locale;
  }
}
