import { DestroyRef, Injector, Signal, afterNextRender, computed, inject, signal } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';

export function injectFieldInvalid(local: Signal<boolean | undefined>): Signal<boolean> {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
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
    return !!control && control.invalid && (control.touched || control.dirty);
  });
}
