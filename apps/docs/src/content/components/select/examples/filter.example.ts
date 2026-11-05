import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-filter-example',
  imports: [TxSelect],
  template: `<tx-select
    [options]="cities"
    [optionLabel]="'name'"
    [optionValue]="'code'"
    [filter]="true"
    [filterBy]="'name,country'"
    [filterPlaceholder]="'City or country'"
    [placeholder]="'City'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectFilterExample {
  readonly cities = [
    { name: 'Kyiv', country: 'Ukraine', code: 'KBP' },
    { name: 'Łódź', country: 'Poland', code: 'LCJ' },
    { name: 'Kraków', country: 'Poland', code: 'KRK' },
    { name: 'München', country: 'Germany', code: 'MUC' },
    { name: 'Zürich', country: 'Switzerland', code: 'ZRH' },
    { name: 'Lisboa', country: 'Portugal', code: 'LIS' },
    { name: 'Málaga', country: 'Spain', code: 'AGP' },
    { name: 'Brno', country: 'Czechia', code: 'BRQ' },
  ];
}
