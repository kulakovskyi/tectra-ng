import { DOCUMENT, Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { TECTRA_CONFIG } from '@tectra/core/config';
import { TxStyleLoader } from '@tectra/core/styles';
import { optionalBoolean } from '@tectra/core/utils';
import { TxRippleStyles } from './ripple.styles';
import { TxRippleRef } from './ripple.types';

@Directive({
  selector: '[txRipple]',
  host: {
    '[class.tx-ripple-host]': 'isEnabled()',
    '[style.--tx-ripple-color]': 'rippleColor() ?? null',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointerup)': 'releasePointerRipples()',
    '(pointerleave)': 'releasePointerRipples()',
    '(pointercancel)': 'releasePointerRipples()',
    '(keydown)': 'onKeyDown($event)',
    '(keyup)': 'onKeyUp($event)',
    '(blur)': 'releaseAll()',
  },
})
export class TxRipple {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);
  private config = inject(TECTRA_CONFIG, { optional: true });
  private txStyleLoader = inject(TxStyleLoader);
  private ripples = new Set<TxRippleRef>();
  private container: HTMLElement | null = null;

  ripple = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  rippleDisabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  rippleCentered = input<boolean, unknown>(false, { transform: booleanAttribute });
  rippleColor = input<string | undefined>(undefined);

  isEnabled = computed(() => !this.rippleDisabled() && (this.ripple() ?? !!this.config?.ripple));

  onPointerDown(event: PointerEvent): void {
    if (event.button === 0 && !event.defaultPrevented) {
      this.launch(event.clientX, event.clientY, false);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      this.launch(0, 0, true);
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.ripples.forEach((ref) => ref.fromKeyboard && this.release(ref));
    }
  }

  releasePointerRipples(): void {
    this.ripples.forEach((ref) => !ref.fromKeyboard && this.release(ref));
  }

  releaseAll(): void {
    this.ripples.forEach((ref) => this.release(ref));
  }

  private launch(clientX: number, clientY: number, fromKeyboard: boolean): void {
    const host = this.elementRef.nativeElement;
    if (!this.isEnabled() || host.matches(':disabled, [aria-disabled="true"]') || typeof host.animate !== 'function') {
      return;
    }
    this.txStyleLoader.load(TxRippleStyles);

    const rect = host.getBoundingClientRect();
    const centered = fromKeyboard || this.rippleCentered();
    const x = centered ? rect.width / 2 : clientX - rect.left;
    const y = centered ? rect.height / 2 : clientY - rect.top;
    const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

    const element = this.document.createElement('span');
    element.className = 'tx-ripple';
    element.style.width = element.style.height = `${radius * 2}px`;
    element.style.left = `${x - radius}px`;
    element.style.top = `${y - radius}px`;
    this.ensureContainer().appendChild(element);

    const ref: TxRippleRef = { element, isEntered: false, isReleased: false, fromKeyboard };
    this.ripples.add(ref);

    const styles = getComputedStyle(host);
    const reduceMotion = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enter = element.animate(
      reduceMotion ? [{ transform: 'scale(1)', opacity: 0 }, { transform: 'scale(1)' }] : [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
      {
        duration: this.readDuration(styles, '--tx-ripple-enter-duration', 450) * (centered ? 0.8 : 1),
        easing: styles.getPropertyValue('--tx-ripple-easing').trim() || 'cubic-bezier(0.2, 0, 0, 1)',
        fill: 'forwards',
      },
    );
    enter.finished.then(() => {
      ref.isEntered = true;
      if (ref.isReleased) {
        this.fadeOut(ref, styles);
      }
    }, () => this.remove(ref));
  }

  private release(ref: TxRippleRef): void {
    if (ref.isReleased) {
      return;
    }
    ref.isReleased = true;
    if (ref.isEntered) {
      this.fadeOut(ref, getComputedStyle(this.elementRef.nativeElement));
    }
  }

  private fadeOut(ref: TxRippleRef, styles: CSSStyleDeclaration): void {
    const opacity = getComputedStyle(ref.element).opacity;
    ref.element
      .animate([{ opacity }, { opacity: 0 }], {
        duration: this.readDuration(styles, '--tx-ripple-exit-duration', 350),
        easing: 'ease-out',
        fill: 'forwards',
      })
      .finished.then(() => this.remove(ref), () => this.remove(ref));
  }

  private remove(ref: TxRippleRef): void {
    ref.element.remove();
    this.ripples.delete(ref);
  }

  private ensureContainer(): HTMLElement {
    const host = this.elementRef.nativeElement;
    if (!this.container || this.container.parentElement !== host) {
      this.container = this.document.createElement('span');
      this.container.className = 'tx-ripple-container';
      this.container.setAttribute('aria-hidden', 'true');
      host.appendChild(this.container);
    }
    return this.container;
  }

  private readDuration(styles: CSSStyleDeclaration, name: string, fallback: number): number {
    const value = styles.getPropertyValue(name).trim();
    const number = parseFloat(value);
    if (Number.isNaN(number)) {
      return fallback;
    }
    return value.endsWith('ms') ? number : number * 1000;
  }
}
