import { InteractivityChecker } from '@angular/cdk/a11y';

const CANDIDATES = 'a[href], area[href], button, input, select, textarea, iframe, audio[controls], video[controls], [tabindex], [contenteditable=""], [contenteditable="true"]';

export function tabbableElements(root: ParentNode, checker: InteractivityChecker): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(CANDIDATES)].filter(
    (element) => !element.closest('[inert]') && checker.isTabbable(element) && checker.isVisible(element),
  );
}

export function nextTabbable(after: Element, checker: InteractivityChecker, skip?: Element): HTMLElement | null {
  const all = tabbableElements(after.ownerDocument, checker);
  return (
    all.find(
      (element) =>
        !after.contains(element) &&
        !skip?.contains(element) &&
        Boolean(after.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
    ) ?? null
  );
}
