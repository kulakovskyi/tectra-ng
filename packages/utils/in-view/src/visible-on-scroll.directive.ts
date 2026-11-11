import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterRenderEffect, inject, input, numberAttribute, output } from '@angular/core';

export interface TxVisibleOnScrollItem {
  id: string;
  ignore?: boolean;
}

@Directive({
  selector: '[txVisibleOnScroll]',
  exportAs: 'txVisibleOnScroll',
})
export class TxVisibleOnScroll {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly emitted = new Set<string>();
  private readonly ids = new Map<Element, string>();
  private observer: IntersectionObserver | null = null;

  readonly items = input<readonly TxVisibleOnScrollItem[]>([], { alias: 'txVisibleOnScroll' });
  readonly visibleRatio = input<number, unknown>(0.99, { transform: numberAttribute });

  readonly itemVisible = output<string>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
    afterRenderEffect(() => this.sync(this.items()));
  }

  private sync(items: readonly TxVisibleOnScrollItem[]): void {
    const Observer = this.view?.IntersectionObserver;
    if (!Observer) {
      return;
    }
    const pending = new Set(items.filter((item) => !item.ignore).map((item) => item.id));
    this.emitted.forEach((id) => !pending.has(id) && this.emitted.delete(id));
    this.observer?.disconnect();
    this.ids.clear();
    this.observer = new Observer((entries) => this.check(entries), { root: this.host, threshold: [this.visibleRatio()] });
    items.forEach((item, index) => {
      const child = this.host.children[index];
      if (child && !item.ignore && !this.emitted.has(item.id)) {
        this.ids.set(child, item.id);
        this.observer?.observe(child);
      }
    });
  }

  private check(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const id = this.ids.get(entry.target);
      if (id === undefined || !entry.isIntersecting || entry.intersectionRatio < this.visibleRatio() || this.emitted.has(id)) {
        continue;
      }
      this.emitted.add(id);
      this.observer?.unobserve(entry.target);
      this.itemVisible.emit(id);
    }
  }
}
