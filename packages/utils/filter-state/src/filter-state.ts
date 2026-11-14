import { DestroyRef, computed, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { TxFilterState, TxFilterStateOptions } from './filter-state.types';
import { injectStorage, readJson, writeJson } from './storage';
import { isSameValue } from './url-filters.functions';
import { TxUrlSync } from './url-sync';

export function txFilterState<T extends object>(options: TxFilterStateOptions<T>): TxFilterState<T> {
  const { key, initial } = options;
  const storage = options.storage === false ? null : injectStorage(options.storage ?? 'local');
  const router = options.url ? inject(Router, { optional: true }) : null;
  const value = signal<T>(initial, { equal: isSameValue });
  const sync = router ? new TxUrlSync<T>(router, () => initial, inject(DestroyRef), (filters) => value.set(filters)) : null;
  const stored = storage ? readJson<Partial<T>>(storage, key) : null;
  value.set(sync?.read() ?? (stored && typeof stored === 'object' ? { ...initial, ...stored } : initial));

  const set = (filters: T): void => {
    if (isSameValue(filters, untracked(value))) {
      return;
    }
    value.set(filters);
    if (storage) {
      if (isSameValue(filters, initial)) {
        storage.removeItem(key);
      } else {
        writeJson(storage, key, filters);
      }
    }
    sync?.write(filters);
  };

  return {
    value: value.asReadonly(),
    isInitial: computed(() => isSameValue(value(), initial)),
    changed: computed(() => (Object.keys(initial) as (keyof T)[]).filter((name) => !isSameValue(value()[name], initial[name]))),
    set,
    patch: (filters) => set({ ...untracked(value), ...filters }),
    reset: () => set(initial),
  };
}
