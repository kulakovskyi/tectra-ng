import { DOCUMENT, Signal, afterRenderEffect, inject } from '@angular/core';

export function linkDescribedBy(target: Element, id: string): () => void {
  const ids = (target.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  if (!ids.includes(id)) {
    target.setAttribute('aria-describedby', [...ids, id].join(' '));
  }
  return () => {
    const rest = (target.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((token) => token && token !== id);
    if (rest.length) {
      target.setAttribute('aria-describedby', rest.join(' '));
    } else {
      target.removeAttribute('aria-describedby');
    }
  };
}

export function injectDescribedBy(targetId: Signal<string | undefined>, id: Signal<string>): void {
  const document = inject(DOCUMENT);
  afterRenderEffect((onCleanup) => {
    const forId = targetId();
    const target = forId ? document.getElementById(forId) : null;
    if (target) {
      onCleanup(linkDescribedBy(target, id()));
    }
  });
}
