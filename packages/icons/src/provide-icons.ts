import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { TxIconRegistry } from './icon-registry.service';
import { TxIconSet } from './icon.types';

export function provideTxIcons(...sets: TxIconSet[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const registry = inject(TxIconRegistry);
      sets.forEach((set) => registry.register(set));
    }),
  ]);
}
