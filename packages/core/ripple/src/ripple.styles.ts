import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { injectTokens } from '@tectra-ng/core/config';
import { RIPPLE_THEME } from './ripple.theme';

@Component({
  selector: 'tx-ripple-styles',
  template: '',
  styles: `
    .tx-ripple-host {
      position: relative;
      isolation: isolate;
      -webkit-tap-highlight-color: transparent;
    }

    .tx-ripple-container {
      position: absolute;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
    }

    .tx-ripple {
      position: absolute;
      border-radius: 50%;
      background: var(--tx-ripple-color, currentColor);
      opacity: var(--tx-ripple-opacity, 0.2);
      transform: scale(0);
      pointer-events: none;
      will-change: transform, opacity;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxRippleStyles {
  private readonly rippleTheme = injectTokens(RIPPLE_THEME);
}
