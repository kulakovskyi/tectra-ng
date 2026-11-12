import { Injectable } from '@angular/core';
import { TxLocaleDefinition } from './tectra-config.interface';

export const TX_LOCALE_LOADERS: Readonly<Record<string, () => Promise<TxLocaleDefinition>>> = {
  ua: () => import('@tectra-ng/core/i18n/ua').then((module) => module.TX_LOCALE_UA),
};

@Injectable({ providedIn: 'root' })
export class TxLocaleRegistry {
  private readonly locales = new Map<string, TxLocaleDefinition>();

  get(code: string): TxLocaleDefinition | undefined {
    return this.locales.get(code);
  }

  add(...locales: TxLocaleDefinition[]): void {
    for (const locale of locales) {
      this.locales.set(locale.code, locale);
    }
  }

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
