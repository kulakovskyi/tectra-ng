import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { TectraConfig } from './tectra-config.interface';
import { TECTRA_CONFIG } from './tectra-config.token';
import { TxThemeService } from './theme.service';

export function provideTectra(config: TectraConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TECTRA_CONFIG, useValue: config },
    provideEnvironmentInitializer(() => {
      const themeService = inject(TxThemeService);
      themeService.applyPreset(config.preset);
      themeService.setMode(config.mode ?? 'light');
    }),
  ]);
}
