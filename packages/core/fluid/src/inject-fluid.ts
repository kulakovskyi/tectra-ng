import { Signal, computed, inject } from '@angular/core';
import { TxFluid } from './fluid.component';

/** Signal that tells whether a component is fluid: its own `fluid` input, else whether it sits inside `tx-fluid`. */
export function injectFluid(local: Signal<boolean | undefined>): Signal<boolean> {
  const container = inject(TxFluid, { optional: true });
  return computed(() => local() ?? !!container);
}
