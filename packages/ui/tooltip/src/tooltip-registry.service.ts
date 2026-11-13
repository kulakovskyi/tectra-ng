import { DOCUMENT, Injectable, inject } from '@angular/core';

const WARM_WINDOW = 400;

/** What the registry needs from an open tooltip: a way to close it at once. */
export interface TxTooltipHandle {
  /** Closes the tooltip without delay. */
  hideNow(): void;
}

/** Keeps one tooltip open at a time and hosts the hidden descriptions that `aria-describedby` points to. */
@Injectable({ providedIn: 'root' })
export class TxTooltipRegistry {
  private document = inject(DOCUMENT);
  private container: HTMLElement | null = null;
  private active: TxTooltipHandle | null = null;
  private lastClosedAt = Number.NEGATIVE_INFINITY;

  /** Creates a hidden description element with the id, for `aria-describedby`. */
  describe(id: string): HTMLElement {
    const node = this.document.createElement('div');
    node.id = id;
    this.ensureContainer().appendChild(node);
    return node;
  }

  /** Removes a description element made by `describe`. */
  forget(node: HTMLElement): void {
    node.remove();
    if (this.container && !this.container.childElementCount) {
      this.container.remove();
      this.container = null;
    }
  }

  /** Whether a tooltip is open or closed a moment ago, so the next one may skip its delay. */
  isWarm(): boolean {
    return this.active !== null || this.now() - this.lastClosedAt < WARM_WINDOW;
  }

  /** Marks the tooltip as the open one and closes the previous one. */
  activate(tooltip: TxTooltipHandle): void {
    if (this.active && this.active !== tooltip) {
      this.active.hideNow();
    }
    this.active = tooltip;
  }

  /** Marks the tooltip as closed, if it is the open one. */
  release(tooltip: TxTooltipHandle): void {
    if (this.active === tooltip) {
      this.active = null;
      this.lastClosedAt = this.now();
    }
  }

  private now(): number {
    return this.document.defaultView?.performance.now() ?? Date.now();
  }

  private ensureContainer(): HTMLElement {
    if (!this.container) {
      this.container = this.document.createElement('div');
      this.container.className = 'tx-tooltip-descriptions';
      this.container.hidden = true;
      this.document.body.appendChild(this.container);
    }
    return this.container;
  }
}
