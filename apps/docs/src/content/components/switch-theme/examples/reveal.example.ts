import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxThemeReveal } from '@tectra-ng/blocks/switch-theme';
import { TxThemeService } from '@tectra-ng/core/config';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'switch-theme-reveal-example',
  imports: [TxButton, TxThemeReveal],
  template: `
    <button
      txButton
      severity="secondary"
      outlined
      txThemeReveal
      [revealDuration]="900"
      [icon]="theme.mode() === 'dark' ? 'sun' : 'moon'"
      (themeChange)="theme.toggleMode()"
    >
      {{ theme.mode() === 'dark' ? 'Light theme' : 'Dark theme' }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwitchThemeRevealExample {
  readonly theme = inject(TxThemeService);
}
