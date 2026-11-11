import { DestroyRef, Directive, ElementRef, afterNextRender, booleanAttribute, inject, input } from '@angular/core';

const FOCUSABLE = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"]), button:not([disabled]), a[href]';

function toEnabled(value: unknown): boolean {
  return value === '' || booleanAttribute(value);
}

@Directive({ selector: '[txAutoFocus]', exportAs: 'txAutoFocus' })
export class TxAutoFocus {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly enabled = input<boolean, unknown>(true, { alias: 'txAutoFocus', transform: toEnabled });
  readonly select = input<boolean, unknown>(false, { transform: booleanAttribute });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!this.enabled()) {
        return;
      }
      const timer = setTimeout(() => this.focus());
      destroyRef.onDestroy(() => clearTimeout(timer));
    });
  }

  focus(): void {
    const target = this.host.matches(FOCUSABLE) ? this.host : this.host.querySelector<HTMLElement>(FOCUSABLE);
    if (!target) {
      return;
    }
    target.focus({ preventScroll: false });
    if (this.select() && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      target.select();
    }
  }
}
