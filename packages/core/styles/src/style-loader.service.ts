import { EnvironmentInjector, Injectable, Type, createComponent, inject } from '@angular/core';

/** Adds the styles of a component once, however many instances use them. */
@Injectable({ providedIn: 'root' })
export class TxStyleLoader {
  private environmentInjector = inject(EnvironmentInjector);
  private loaded = new Set<Type<unknown>>();

  /** Creates the style-only component the first time it is passed; later calls do nothing. */
  load(styles: Type<unknown>): void {
    if (this.loaded.has(styles)) {
      return;
    }
    this.loaded.add(styles);
    createComponent(styles, { environmentInjector: this.environmentInjector });
  }
}
