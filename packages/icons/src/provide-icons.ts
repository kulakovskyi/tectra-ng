import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { TxIconRegistry } from './icon-registry.service';
import { TxIconSet } from './icon.types';

/** Registers icons for `tx-icon` and every component of the app: the whole set with `provideTxIcons(TX_ICONS)` or only the ones you use. */
export function provideTxIcons(...sets: TxIconSet[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const registry = inject(TxIconRegistry);
      sets.forEach((set) => registry.register(set));
    }),
  ]);
}
