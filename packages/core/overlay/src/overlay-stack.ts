import { Injectable } from '@angular/core';

function isShown(element: HTMLElement): boolean {
  try {
    return element.matches(':popover-open');
  } catch {
    return false;
  }
}

/**
 * Keeps the overlays in one stacking order: every overlay sits in the browser top layer in the order it
 * opened, a modal layer closes the transient overlays (popovers, menus, dropdown panels, tooltips) when it
 * opens, and the elements kept on top (toasts) move back above it.
 */
@Injectable({ providedIn: 'root' })
export class TxOverlayStack {
  private readonly transient = new Set<() => void>();
  private readonly onTop = new Set<HTMLElement>();

  /** Registers the close function of an open transient overlay; returns a function that removes it. */
  addTransient(close: () => void): () => void {
    this.transient.add(close);
    return () => this.transient.delete(close);
  }

  /**
   * Shows the element in the top layer and keeps it above every modal layer opened later; returns a function
   * that stops it. Does nothing where the browser has no popover support.
   */
  keepOnTop(element: HTMLElement): () => void {
    if (typeof element.showPopover !== 'function') {
      return () => undefined;
    }
    if (!element.hasAttribute('popover')) {
      element.setAttribute('popover', 'manual');
    }
    if (!isShown(element)) {
      element.showPopover();
    }
    this.onTop.add(element);
    return () => this.onTop.delete(element);
  }

  /** Closes every open transient overlay; a modal layer calls it before it opens. */
  closeTransient(): void {
    [...this.transient].forEach((close) => close());
    this.transient.clear();
  }

  /** Moves the elements kept on top above the newest top-layer element; a modal layer calls it once it is shown. */
  raise(): void {
    this.onTop.forEach((element) => {
      if (isShown(element)) {
        element.hidePopover();
        element.showPopover();
      }
    });
  }
}
