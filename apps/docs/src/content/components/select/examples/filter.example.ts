import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-filter-example',
  imports: [TxSelect],
  template: `<tx-select [options]="countries" [optionLabel]="'name'" [optionValue]="'code'" [filter]="true" [placeholder]="'Country'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectFilterExample {
  countries = [
    { name: 'Ukraine', code: 'UA' },
    { name: 'Poland', code: 'PL' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Spain', code: 'ES' },
    { name: 'Italy', code: 'IT' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Netherlands', code: 'NL' },
  ];
}
