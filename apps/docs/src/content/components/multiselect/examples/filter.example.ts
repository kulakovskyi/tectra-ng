import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMultiselect } from '@tectra/ui/multiselect';

@Component({
  selector: 'multiselect-filter-example',
  imports: [TxMultiselect],
  template: `<tx-multiselect
    [options]="countries"
    [optionLabel]="'name'"
    [optionValue]="'code'"
    [filter]="true"
    [placeholder]="'Countries'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectFilterExample {
  readonly countries = [
    { name: 'Austria', code: 'AT' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Czechia', code: 'CZ' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Estonia', code: 'EE' },
    { name: 'Finland', code: 'FI' },
    { name: 'Latvia', code: 'LV' },
    { name: 'Lithuania', code: 'LT' },
    { name: 'Poland', code: 'PL' },
    { name: 'Ukraine', code: 'UA' },
  ];
}
