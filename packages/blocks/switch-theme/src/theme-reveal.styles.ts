import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { SWITCH_THEME_ICON_DEFAULTS } from './switch-theme.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { SWITCH_THEME_THEME } from './switch-theme.theme';

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
  viewProviders: [provideTxIconDefaults(SWITCH_THEME_ICON_DEFAULTS)],
})
export class TxThemeRevealStyles {
  private readonly switchThemeTheme = injectTokens(SWITCH_THEME_THEME);
}
