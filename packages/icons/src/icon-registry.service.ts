import { Injectable, signal } from '@angular/core';
import { TxIconPath, TxIconSet } from './icon.types';

@Injectable({ providedIn: 'root' })
export class TxIconRegistry {
  private readonly icons = signal<TxIconSet>({});
  private readonly warned = new Set<string>();

  register(set: TxIconSet): void {
    this.icons.update((current) => ({ ...current, ...set }));
  }

  get(name: string): TxIconPath[] | undefined {
    const icons = this.icons();
    return icons[name] ?? icons[name.replace(/^pi-/, '')];
  }

  has(name: string | undefined): boolean {
    return !!name && !!this.get(name);
  }

  warnMissing(name: string): void {
    if (this.warned.has(name)) {
      return;
    }
    this.warned.add(name);
    console.warn(
      `tectra: no icon named "${name}" is registered. Register the whole set with provideTxIcons(TX_ICONS) or only what you use, for example provideTxIcons({ '${name.replace(/^pi-/, '')}': txIcon… }) from @tectra-ng/icons.`,
    );
  }
}
