import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxThemeConfigurator } from '@tectra-ng/blocks/theme-configurator';
import { softStyle, tectraStyle } from '@tectra-ng/themes';

@Component({
  selector: 'theme-configurator-design-tokens-example',
  imports: [TxThemeConfigurator],
  template: `<tx-theme-configurator [styles]="styles" [dt]="tokens" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ThemeConfiguratorDesignTokensExample {
  readonly styles = [tectraStyle, softStyle];
  readonly tokens = {
    root: { width: '22rem', gap: '24px', labelColor: 'var(--tx-primary-soft-text)' },
  };
}
