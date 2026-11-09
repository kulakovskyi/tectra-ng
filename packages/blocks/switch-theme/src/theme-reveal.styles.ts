import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tx-theme-reveal-styles',
  template: '',
  styles: `
    html.tx-theme-reveal::view-transition-old(root),
    html.tx-theme-reveal::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }

    html.tx-theme-reveal *,
    html.tx-theme-reveal *::before,
    html.tx-theme-reveal *::after {
      transition: none !important;
      view-transition-name: none !important;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxThemeRevealStyles {}
