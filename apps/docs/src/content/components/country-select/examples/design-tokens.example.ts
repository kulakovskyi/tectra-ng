import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountrySelect } from '@tectra-ng/ui/country-select';

@Component({
  selector: 'country-select-design-tokens-example',
  imports: [TxCountrySelect],
  template: `<tx-country-select
    [placeholder]="'Country'"
    [dt]="{ overlay: { borderRadius: '16px' }, option: { borderRadius: '999px' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountrySelectDesignTokensExample {}
