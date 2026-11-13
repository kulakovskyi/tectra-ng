import { DOCUMENT, Directive, ElementRef, inject, input, numberAttribute, output } from '@angular/core';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { TxThemeRevealOrigin } from './switch-theme.types';
import { TxThemeRevealStyles } from './theme-reveal.styles';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { SWITCH_THEME_ICON_DEFAULTS } from './switch-theme.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { SWITCH_THEME_THEME } from './switch-theme.theme';

const REVEAL_CLASS = 'tx-theme-reveal';

/** Default easing of the circle that reveals the new theme. */
export const TX_THEME_REVEAL_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * On any element that changes the theme: grows the new theme as a circle from the click, then emits
 * `themeChange`.
 */
@Directive({
  selector: '[txThemeReveal]',
  host: { '(click)': 'reveal($event)' },
  providers: [provideTxIconDefaults(SWITCH_THEME_ICON_DEFAULTS)],
})
export class TxThemeReveal {
  private readonly switchThemeTheme = injectTokens(SWITCH_THEME_THEME);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly revealDuration = input<number, unknown>(550, { transform: numberAttribute });
  readonly revealEasing = input<string>(TX_THEME_REVEAL_EASING);

  readonly themeChange = output<void>();

  constructor() {
    inject(TxStyleLoader).load(TxThemeRevealStyles);
  }

  reveal(event: MouseEvent): void {
    const view = this.document.defaultView;
    if (!view || typeof this.document.startViewTransition !== 'function' || view.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.themeChange.emit();
      return;
    }
    const origin = this.origin(event);
    const radius = Math.hypot(Math.max(origin.x, view.innerWidth - origin.x), Math.max(origin.y, view.innerHeight - origin.y));
    const root = this.document.documentElement;
    root.classList.add(REVEAL_CLASS);
    const transition = this.document.startViewTransition(() => this.themeChange.emit());
    void transition.ready.then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
        { duration: this.revealDuration(), easing: this.revealEasing(), pseudoElement: '::view-transition-new(root)' },
      ),
    );
    void transition.finished.finally(() => root.classList.remove(REVEAL_CLASS));
  }

  private origin(event: MouseEvent): TxThemeRevealOrigin {
    if (event.clientX || event.clientY) {
      return { x: event.clientX, y: event.clientY };
    }
    const rect = this.host.nativeElement.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
}
