import { InjectionToken, Provider, inject, isDevMode } from '@angular/core';
import { TxIconRegistry } from './icon-registry.service';
import { TxIconPath, TxIconSet } from './icon.types';

/** Icons a component draws itself (chevrons, close, check); filled by `provideTxIconDefaults` so they work without registering them. */
export const TX_ICON_DEFAULTS = new InjectionToken<TxIconSet>('TX_ICON_DEFAULTS');

/** Adds a component's own icons to `TX_ICON_DEFAULTS`; components call it in their `providers`, an app may use it to replace them. */
export function provideTxIconDefaults(set: TxIconSet): Provider {
  return { provide: TX_ICON_DEFAULTS, useFactory: () => ({ ...inject(TX_ICON_DEFAULTS, { skipSelf: true, optional: true }), ...set }) };
}

/** Finds icons in the registered set first, then in the defaults of the components. */
export interface TxIconLookup {
  /** The paths of an icon, or `undefined` when no icon has this name. */
  get(name: string): TxIconPath[] | undefined;
  /** Whether an icon exists; in development warns once about a name that is not registered. */
  has(name: string | undefined): boolean;
}

/** The icon lookup of the current injector; call it in an injection context. */
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

/** The icon name without the `pi-` prefix. */
export function withoutIconPrefix(name: string): string {
  return name.replace(/^pi-/, '');
}
