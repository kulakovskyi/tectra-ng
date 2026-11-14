import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxThemeConfigurator } from '@tectra-ng/blocks/theme-configurator';
import { edgeStyle, paperStyle, softStyle, tectraStyle } from '@tectra-ng/themes';

@Component({
  selector: 'theme-configurator-basic-example',
  imports: [TxThemeConfigurator],
  template: `<tx-theme-configurator [styles]="styles" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ThemeConfiguratorBasicExample {
  readonly styles = [tectraStyle, softStyle, edgeStyle, paperStyle];
}
