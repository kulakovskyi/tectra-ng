import { Signal } from '@angular/core';

export type TxStorageKind = 'local' | 'session' | 'memory';

export interface TxFilterStateOptions<T extends object> {
  key: string;
  initial: T;
  url?: boolean;
  storage?: TxStorageKind | false;
}

export interface TxFilterState<T extends object> {
  readonly value: Signal<T>;
  readonly isInitial: Signal<boolean>;
  readonly changed: Signal<(keyof T)[]>;
  set(filters: T): void;
  patch(filters: Partial<T>): void;
  reset(): void;
}
