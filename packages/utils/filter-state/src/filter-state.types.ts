import { Signal } from '@angular/core';

/** Where filters are kept: `local` or `session` browser storage, or `memory`. */
export type TxStorageKind = 'local' | 'session' | 'memory';

/** Options of `txFilterState`: the storage key, initial filters and where they are kept. */
export interface TxFilterStateOptions<T extends object> {
  /** Storage key the filters are saved under. */
  key: string;
  /** Filters when nothing is saved; the values that differ from it are saved and put in the URL. */
  initial: T;
  /** Keeps the filters in the query string and follows back and forward in the history (default `false`). */
  url?: boolean;
  /** `local` (default), `session` or `memory`; `false` keeps nothing. */
  storage?: TxStorageKind | false;
}

/**
 * Filters as signals, created by `txFilterState`: read, change, reset and see what differs from the
 * initial values.
 */
export interface TxFilterState<T extends object> {
  readonly value: Signal<T>;
  readonly isInitial: Signal<boolean>;
  readonly changed: Signal<(keyof T)[]>;
  set(filters: T): void;
  patch(filters: Partial<T>): void;
  reset(): void;
}
