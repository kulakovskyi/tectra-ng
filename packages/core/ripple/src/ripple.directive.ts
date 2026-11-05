import { DOCUMENT, Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { TECTRA_CONFIG } from '@tectra/core/config';
import { TxStyleLoader } from '@tectra/core/styles';
import { TxRippleStyles } from './ripple.styles';

@Directive({
  selector: '[txRipple]',
  host: {
    '[class.tx-ripple-host]': 'isEnabled()',
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class TxRipple {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);
  private config = inject(TECTRA_CONFIG, { optional: true });

  rippleDisabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  isEnabled = computed(() => !!this.config?.ripple && !this.rippleDisabled());

  constructor() {
    if (this.config?.ripple) {
      inject(TxStyleLoader).load(TxRippleStyles);
    }
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.isEnabled()) {
      return;
    }
    const host = this.elementRef.nativeElement;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = this.document.createElement('span');
    ripple.className = 'tx-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    ripple.addEventListener('animationend', () => ripple.remove());
    host.appendChild(ripple);
  }
}
