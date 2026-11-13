import { Injectable, signal } from '@angular/core';
import { TxIconPath, TxIconSet } from './icon.types';

/** The icons registered by `provideTxIcons`; one per app. */
@Injectable({ providedIn: 'root' })
export class TxIconRegistry {
  private readonly icons = signal<TxIconSet>({});
  private readonly warned = new Set<string>();

  /** Adds icons; a name registered again replaces the earlier one. */
  register(set: TxIconSet): void {
    this.icons.update((current) => ({ ...current, ...set }));
  }

  /** The paths of a registered icon, with or without the `pi-` prefix. */
  get(name: string): TxIconPath[] | undefined {
    const icons = this.icons();
    return icons[name] ?? icons[name.replace(/^pi-/, '')];
  }

  /** Whether an icon with this name is registered. */
  has(name: string | undefined): boolean {
    return !!name && !!this.get(name);
  }

  /** Warns once in the console that an icon is not registered and how to register it. */
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
