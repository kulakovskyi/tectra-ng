import { InjectionToken, Provider, inject, isDevMode } from '@angular/core';
import { TxIconRegistry } from './icon-registry.service';
import { TxIconPath, TxIconSet } from './icon.types';

export const TX_ICON_DEFAULTS = new InjectionToken<TxIconSet>('TX_ICON_DEFAULTS');

export function provideTxIconDefaults(set: TxIconSet): Provider {
  return { provide: TX_ICON_DEFAULTS, useFactory: () => ({ ...inject(TX_ICON_DEFAULTS, { skipSelf: true, optional: true }), ...set }) };
}

export interface TxIconLookup {
  get(name: string): TxIconPath[] | undefined;
  has(name: string | undefined): boolean;
}

export function injectTxIcons(): TxIconLookup {
  const registry = inject(TxIconRegistry);
  const defaults = inject(TX_ICON_DEFAULTS, { optional: true }) ?? {};
  const get = (name: string) => registry.get(name) ?? defaults[name] ?? defaults[withoutIconPrefix(name)];
  return {
    get,
    has: (name) => {
      if (!name) {
        return false;
      }
      const found = !!get(name);
      if (!found && isDevMode() && /^[a-z0-9-]+$/.test(name)) {
        registry.warnMissing(name);
      }
      return found;
    },
  };
}

export function withoutIconPrefix(name: string): string {
  return name.replace(/^pi-/, '');
}
