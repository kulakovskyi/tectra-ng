import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxThemeConfigurator } from '@tectra-ng/blocks/theme-configurator';
import { TectraPrimary, tectraPrimaryChoices } from '@tectra-ng/themes';

const BRAND: TectraPrimary[] = ['blue', 'teal', 'violet', 'rose', 'noir'];

@Component({
  selector: 'theme-configurator-choices-example',
  imports: [TxThemeConfigurator],
  template: `<tx-theme-configurator
    [primaries]="primaries"
    [surfaces]="[]"
    [showRipple]="false"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ThemeConfiguratorChoicesExample {
  readonly primaries = tectraPrimaryChoices().filter((choice) => BRAND.includes(choice.value));
}
