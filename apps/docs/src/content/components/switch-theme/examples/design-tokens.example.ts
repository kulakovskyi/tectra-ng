import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSwitchTheme } from '@tectra-ng/blocks/switch-theme';

@Component({
  selector: 'switch-theme-design-tokens-example',
  imports: [TxSwitchTheme],
  template: `
    <tx-switch-theme
      [dt]="{
        root: { size: '44px', borderRadius: '12px', background: 'var(--tx-surface-ground)' },
        icon: { size: '17.5px' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwitchThemeDesignTokensExample {}
