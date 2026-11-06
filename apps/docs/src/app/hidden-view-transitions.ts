import { DOCUMENT, inject } from '@angular/core';

export function skipViewTransitionsWhileHidden(): void {
  const document = inject(DOCUMENT);
  const start = document.startViewTransition?.bind(document);
  if (!start) {
    return;
  }
  document.startViewTransition = ((update?: ViewTransitionUpdateCallback | StartViewTransitionOptions) => {
    if (document.visibilityState !== 'hidden') {
      return start(update);
    }
    const callback = typeof update === 'function' ? update : update?.update;
    const done = Promise.resolve(callback?.()).then(() => undefined);
    return { updateCallbackDone: done, ready: done, finished: done, skipTransition: () => undefined, types: new Set<string>() } as unknown as ViewTransition;
  }) as Document['startViewTransition'];
}
