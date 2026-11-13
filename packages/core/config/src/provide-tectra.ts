import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer, provideEnvironmentInitializer } from '@angular/core';
import { TxLocaleRegistry } from './locale-registry';
import { TectraConfig } from './tectra-config.interface';
import { TECTRA_CONFIG } from './tectra-config.token';
import { TxThemeService } from './theme.service';

/** Registers the tectra config in the app: applies the preset and color scheme and registers locales. */
export function provideTectra(config: TectraConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TECTRA_CONFIG, useValue: config },
    provideEnvironmentInitializer(() => {
      const themeService = inject(TxThemeService);
      themeService.applyPreset(config.preset);
      themeService.setMode(config.mode ?? 'light');
    }),
    provideAppInitializer(async () => {
      const registry = inject(TxLocaleRegistry);
      registry.add(...(config.locales ?? []));
      if (typeof config.locale === 'string') {
        await registry.load(config.locale);
      }
    }),
  ]);
}
