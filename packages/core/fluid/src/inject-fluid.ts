import { Signal, computed, inject } from '@angular/core';
import { TxFluid } from './fluid.component';

export function injectFluid(local: Signal<boolean | undefined>): Signal<boolean> {
  const container = inject(TxFluid, { optional: true });
  return computed(() => local() ?? !!container);
}
