import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';
import { TxStorageKind } from './filter-state.types';

export class TxMemoryStorage implements Storage {
  private readonly items = new Map<string, string>();

  constructor(source?: Storage) {
    if (!source) {
      return;
    }
    for (let index = 0; index < source.length; index++) {
      const key = source.key(index);
      if (key !== null) {
        this.items.set(key, source.getItem(key) ?? '');
      }
    }
  }

  get length(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.items.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }

  setItem(key: string, value: string): void {
    this.items.set(key, String(value));
  }
}

const MEMORY = new InjectionToken<Record<TxStorageKind, TxMemoryStorage>>('TX_MEMORY_STORAGE', {
  providedIn: 'root',
  factory: () => ({ local: new TxMemoryStorage(), session: new TxMemoryStorage(), memory: new TxMemoryStorage() }),
});

export function injectStorage(kind: TxStorageKind = 'local'): Storage {
  const memory = inject(MEMORY);
  const view = inject(DOCUMENT).defaultView;
  if (kind === 'memory' || !view) {
    return memory[kind];
  }
  try {
    const storage = kind === 'local' ? view.localStorage : view.sessionStorage;
    const probe = '__tx_storage__';
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return storage;
  } catch {
    return memory[kind];
  }
}

export function readJson<T>(storage: Storage, key: string): T | null {
  const stored = storage.getItem(key);
  if (stored === null) {
    return null;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export function writeJson(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}
