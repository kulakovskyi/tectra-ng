import { DOCUMENT, Injectable, inject } from '@angular/core';

const WARM_WINDOW = 400;

export interface TxTooltipHandle {
  hideNow(): void;
}

@Injectable({ providedIn: 'root' })
export class TxTooltipRegistry {
  private document = inject(DOCUMENT);
  private container: HTMLElement | null = null;
  private active: TxTooltipHandle | null = null;
  private lastClosedAt = Number.NEGATIVE_INFINITY;

  describe(id: string): HTMLElement {
    const node = this.document.createElement('div');
    node.id = id;
    this.ensureContainer().appendChild(node);
    return node;
  }

  forget(node: HTMLElement): void {
    node.remove();
    if (this.container && !this.container.childElementCount) {
      this.container.remove();
      this.container = null;
    }
  }

  isWarm(): boolean {
    return this.active !== null || this.now() - this.lastClosedAt < WARM_WINDOW;
  }

  activate(tooltip: TxTooltipHandle): void {
    if (this.active && this.active !== tooltip) {
      this.active.hideNow();
    }
    this.active = tooltip;
  }

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
