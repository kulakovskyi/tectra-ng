import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxSwitchTheme } from '@tectra-ng/blocks/switch-theme';
import { TxThemeService } from '@tectra-ng/core/config';

@Component({
  selector: 'switch-theme-basic-example',
  imports: [TxSwitchTheme],
  template: `
    <div class="row">
      <tx-switch-theme />
      <span class="hint">Now: {{ theme.mode() }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hint {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwitchThemeBasicExample {
  readonly theme = inject(TxThemeService);
}
