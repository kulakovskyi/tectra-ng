import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { DOCUMENT, Directive, ElementRef, OnDestroy, afterNextRender, booleanAttribute, effect, inject, input } from '@angular/core';

@Directive({ selector: '[txFocusTrap]' })
export class TxFocusTrap implements OnDestroy {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private focusTrapFactory = inject(FocusTrapFactory);
  private document = inject(DOCUMENT);
  private focusTrap: FocusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement, true);
  private previousFocus = this.document.activeElement as HTMLElement | null;

  txFocusTrap = input<boolean, unknown>(true, { transform: booleanAttribute });
  autoFocus = input<boolean, unknown>(true, { transform: booleanAttribute });
  restoreFocus = input<boolean, unknown>(true, { transform: booleanAttribute });

  constructor() {
    effect(() => {
      this.focusTrap.enabled = this.txFocusTrap();
    });
    afterNextRender(() => {
      if (this.autoFocus()) {
        this.focusTrap.focusInitialElement();
      }
    });
  }

  ngOnDestroy(): void {
    this.focusTrap.destroy();
    if (this.restoreFocus() && this.previousFocus?.isConnected) {
      this.previousFocus.focus();
    }
  }
}
