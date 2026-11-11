import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, Renderer2, afterNextRender, booleanAttribute, inject, input, numberAttribute, output, signal } from '@angular/core';

const split = (classes: string | undefined): string[] => (classes ?? '').split(/\s+/).filter(Boolean);

@Directive({
  selector: '[txInView]',
  exportAs: 'txInView',
  host: { '[class.tx-in-view]': 'isInView()' },
})
export class TxInView {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly view = inject(DOCUMENT).defaultView;

  readonly threshold = input<number, unknown>(0.3, { transform: numberAttribute });
  readonly rootMargin = input<string>('0px');
  readonly once = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly enterClass = input<string | undefined>(undefined);
  readonly leaveClass = input<string | undefined>(undefined);

  readonly entered = output<void>();
  readonly left = output<void>();

  readonly isInView = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const Observer = this.view?.IntersectionObserver;
      if (!Observer) {
        this.update(true);
        return;
      }
      const observer = new Observer(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          if (visible === this.isInView()) {
            return;
          }
          this.update(visible);
          if (visible && this.once()) {
            observer.disconnect();
          }
        },
        { threshold: this.threshold(), rootMargin: this.rootMargin() },
      );
      observer.observe(this.element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private update(visible: boolean): void {
    this.isInView.set(visible);
    const [add, remove] = visible ? [this.enterClass(), this.leaveClass()] : [this.leaveClass(), this.enterClass()];
    split(remove).forEach((name) => this.renderer.removeClass(this.element, name));
    split(add).forEach((name) => this.renderer.addClass(this.element, name));
    if (visible) {
      this.entered.emit();
    } else {
      this.left.emit();
    }
  }
}
