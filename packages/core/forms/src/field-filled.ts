import { DestroyRef, ElementRef, Injector, Signal, afterNextRender, inject, signal } from '@angular/core';
import { NgControl } from '@angular/forms';

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
