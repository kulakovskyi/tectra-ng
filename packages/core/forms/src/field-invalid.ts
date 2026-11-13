import { DestroyRef, Injector, Signal, afterNextRender, computed, inject, signal } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { TX_FIELD_STATE } from './field-state';

/**
 * Signal that tells whether a field shows its invalid state: the own `invalid` input, else the enclosing
 * field, else an invalid form control that was touched or changed.
 */
export function injectFieldInvalid(local: Signal<boolean | undefined>): Signal<boolean> {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  const fieldState = inject(TX_FIELD_STATE, { optional: true });
  const version = signal(0);
  let control: AbstractControl | null = null;

  afterNextRender(() => {
    control = injector.get(NgControl, null, { self: true, optional: true })?.control ?? null;
    if (control) {
      const subscription = control.events.subscribe(() => version.update((value) => value + 1));
      destroyRef.onDestroy(() => subscription.unsubscribe());
      version.update((value) => value + 1);
    }
  });

  return computed(() => {
    version();
    const own = local();
    if (own !== undefined) {
      return own;
    }
    if (fieldState?.invalid()) {
      return true;
    }
    return !!control && control.invalid && (control.touched || control.dirty);
  });
}
