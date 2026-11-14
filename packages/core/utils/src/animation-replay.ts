import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Plays the CSS animations of its element again whenever the bound key changes, without re-creating the
 * element (a one-item `@for` would warn with NG0956). The animation stays driven by CSS, so `animation-play-state`
 * keeps working. The first value only starts the animation as usual.
 */
@Directive({ selector: '[txAnimationReplay]' })
export class TxAnimationReplay {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private started = false;
  private last: unknown;

  /** The key; a new value restarts the animations of the element. */
  readonly key = input<unknown>(undefined, { alias: 'txAnimationReplay' });

  constructor() {
    effect(() => {
      const key = this.key();
      const replay = this.started && !Object.is(key, this.last);
      this.started = true;
      this.last = key;
      if (!replay || typeof this.element.getAnimations !== 'function') {
        return;
      }
      const style = this.element.style;
      const own = style.getPropertyValue('animation-name');
      style.setProperty('animation-name', 'none');
      void this.element.offsetWidth;
      if (own) {
        style.setProperty('animation-name', own);
      } else {
        style.removeProperty('animation-name');
      }
    });
  }
}
