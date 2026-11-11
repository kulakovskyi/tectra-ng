import { DestroyRef, Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectStorage, readJson, writeJson } from './storage';
import { TxUrlSync } from './url-sync';

@Injectable()
export abstract class TxSaveFilters<T> {
  private readonly filterStorage = injectStorage('local');

  protected abstract localStorageKey: string;

  protected storeFilters(filters: T): void {
    writeJson(this.filterStorage, this.localStorageKey, filters);
  }

  protected getStoredFilters(): T | null {
    return readJson<T>(this.filterStorage, this.localStorageKey);
  }
}

@Injectable()
export abstract class TxUrlFilters<T extends object> extends TxSaveFilters<T> {
  private readonly urlSync = new TxUrlSync<T>(inject(Router), () => this.initialFilters(), inject(DestroyRef), (filters) => this.applyUrlFilters?.(filters));

  protected abstract initialFilters(): T;

  protected applyUrlFilters?(filters: T): void;

  protected override storeFilters(filters: T): void {
    super.storeFilters(filters);
    this.urlSync.write(filters);
  }

  protected override getStoredFilters(): T | null {
    return this.urlSync.read() ?? super.getStoredFilters();
  }
}
