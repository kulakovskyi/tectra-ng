import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTopbarPreferences } from '@tectra-ng/blocks/topbar-preferences';

@Component({
  selector: 'topbar-preferences-design-tokens-example',
  imports: [TxTopbarPreferences],
  template: `
    <tx-topbar-preferences
      [syncLocale]="false"
      [dt]="{
        root: { controlSize: '35px', gap: '7px' },
        divider: { height: '21px' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TopbarPreferencesDesignTokensExample {}
