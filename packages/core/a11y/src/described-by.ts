import { DOCUMENT, Signal, afterRenderEffect, inject } from '@angular/core';

/** ARIA attributes that hold a list of element ids. */
export type TxAriaReference = 'aria-describedby' | 'aria-labelledby' | 'aria-controls' | 'aria-owns';

/**
 * Adds an id to an ARIA reference attribute of an element without duplicating it; returns a function that
 * removes it again.
 */
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

/** Adds an id to `aria-describedby` of an element; returns a function that removes it again. */
export function linkDescribedBy(target: Element, id: string): () => void {
  return linkAriaReference(target, 'aria-describedby', id);
}

/**
 * Keeps the element with the target id described by the element with the given id, while both ids are set;
 * call in an injection context.
 */
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
