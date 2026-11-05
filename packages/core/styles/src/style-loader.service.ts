import { EnvironmentInjector, Injectable, Type, createComponent, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TxStyleLoader {
  private environmentInjector = inject(EnvironmentInjector);
  private loaded = new Set<Type<unknown>>();

  load(styles: Type<unknown>): void {
    if (this.loaded.has(styles)) {
      return;
    }
    this.loaded.add(styles);
    createComponent(styles, { environmentInjector: this.environmentInjector });
  }
}
