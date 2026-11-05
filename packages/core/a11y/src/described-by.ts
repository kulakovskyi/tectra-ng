import { DOCUMENT, Signal, afterRenderEffect, inject } from '@angular/core';

export type TxAriaReference = 'aria-describedby' | 'aria-labelledby' | 'aria-controls' | 'aria-owns';

export function linkAriaReference(target: Element, attribute: TxAriaReference, id: string): () => void {
  const ids = (target.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean);
  if (!ids.includes(id)) {
    target.setAttribute(attribute, [...ids, id].join(' '));
  }
  return () => {
    const rest = (target.getAttribute(attribute) ?? '').split(/\s+/).filter((token) => token && token !== id);
    if (rest.length) {
      target.setAttribute(attribute, rest.join(' '));
    } else {
      target.removeAttribute(attribute);
    }
  };
}

export function linkDescribedBy(target: Element, id: string): () => void {
  return linkAriaReference(target, 'aria-describedby', id);
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
