import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountryOption, TxCountrySelect } from '@tectra/ui/country-select';

@Component({
  selector: 'country-select-counts-example',
  imports: [TxCountrySelect],
  template: `<tx-country-select
    [options]="stats"
    [multiple]="true"
    [shape]="'circle'"
    [placeholder]="'Traffic by country'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountrySelectCountsExample {
  readonly stats: TxCountryOption[] = [
    { code: 'US', count: 1840 },
    { code: 'GB', count: 920, hint: 'incl. crown dependencies' },
    { code: 'DE', count: 711 },
    { code: 'UA', count: 655 },
    { code: 'PL', count: 402 },
    { code: 'CN', count: 0, disabled: true, hint: 'not served' },
  ];
}
