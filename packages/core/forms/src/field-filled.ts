import { DestroyRef, ElementRef, Injector, Signal, afterNextRender, inject, signal } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Signal that tells whether the native input or textarea of the host has a value; used for floating labels. */
export function injectFieldFilled(): Signal<boolean> {
  const element = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef).nativeElement;
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  const filled = signal(false);

  afterNextRender(() => {
    const update = () => filled.set(element.value !== '');
    element.addEventListener('input', update);
    const subscription = injector.get(NgControl, null, { self: true, optional: true })?.control?.events.subscribe(() => queueMicrotask(update));
    destroyRef.onDestroy(() => {
      element.removeEventListener('input', update);
      subscription?.unsubscribe();
    });
    update();
  });

  return filled.asReadonly();
}
