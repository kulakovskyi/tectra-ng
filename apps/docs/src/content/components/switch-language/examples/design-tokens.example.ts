import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSwitchLanguage } from '@tectra-ng/blocks/switch-language';

@Component({
  selector: 'switch-language-design-tokens-example',
  imports: [TxSwitchLanguage],
  template: `
    <tx-switch-language
      [syncLocale]="false"
      [dt]="{
        root: { height: '44px', padding: '4px' },
        thumb: { background: 'var(--tx-primary-base)', ringColor: 'transparent' },
        option: {
          minWidth: '52px',
          fontSize: '12.25px',
          activeColor: 'var(--tx-primary-contrast)',
        },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwitchLanguageDesignTokensExample {}
