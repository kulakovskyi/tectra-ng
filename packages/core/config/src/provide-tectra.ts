import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer, provideEnvironmentInitializer } from '@angular/core';
import { TxLocaleRegistry } from './locale-registry';
import { TxLocaleStorage } from './locale-storage';
import { TectraConfig } from './tectra-config.interface';
import { TECTRA_CONFIG } from './tectra-config.token';
import { TxThemeService } from './theme.service';

/** Registers the tectra config in the app: applies the preset, the color scheme and a remembered theme choice and registers locales. */
export function provideTectra(config: TectraConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TECTRA_CONFIG, useValue: config },
    provideEnvironmentInitializer(() => {
      inject(TxThemeService).applyConfig();
    }),
    provideAppInitializer(async () => {
      const registry = inject(TxLocaleRegistry);
      registry.add(...(config.locales ?? []));
      const codes = [inject(TxLocaleStorage).read(), config.locale].filter((code): code is string => typeof code === 'string');
      await Promise.all(codes.map((code) => registry.load(code)));
    }),
  ]);
}
