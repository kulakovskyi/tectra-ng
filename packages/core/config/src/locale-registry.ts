import { Injectable } from '@angular/core';
import { TxLocaleDefinition } from './tectra-config.interface';

/** Lazy loaders of the built-in locales by code. */
export const TX_LOCALE_LOADERS: Readonly<Record<string, () => Promise<TxLocaleDefinition>>> = {
  ua: () => import('@tectra-ng/core/i18n/ua').then((module) => module.TX_LOCALE_UA),
};

/** Holds the known locale definitions and loads the built-in ones on demand. */
@Injectable({ providedIn: 'root' })
export class TxLocaleRegistry {
  private readonly locales = new Map<string, TxLocaleDefinition>();

  /** Returns a registered locale by code. */
  get(code: string): TxLocaleDefinition | undefined {
    return this.locales.get(code);
  }

  /** Registers locale definitions by their codes, replacing the same codes. */
  add(...locales: TxLocaleDefinition[]): void {
    for (const locale of locales) {
      this.locales.set(locale.code, locale);
    }
  }

  /**
   * Returns a locale by code, loading a built-in one if it is not registered yet; `undefined` for an unknown
   * code.
   */
  async load(code: string): Promise<TxLocaleDefinition | undefined> {
    const known = this.locales.get(code);
    if (known || !TX_LOCALE_LOADERS[code]) {
      return known;
    }
    const locale = await TX_LOCALE_LOADERS[code]();
    this.add(locale);
    return locale;
  }
}
