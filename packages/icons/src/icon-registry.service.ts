import { Injectable, signal } from '@angular/core';
import { TxIconPath, TxIconSet } from './icon.types';
import { TX_ICONS } from './icons';

@Injectable({ providedIn: 'root' })
export class TxIconRegistry {
  private readonly icons = signal<TxIconSet>(TX_ICONS);

  register(set: TxIconSet): void {
    this.icons.update((current) => ({ ...current, ...set }));
  }

  get(name: string): TxIconPath[] | undefined {
    return this.icons()[name];
  }

  has(name: string | undefined): boolean {
    return !!name && name in this.icons();
  }
}
