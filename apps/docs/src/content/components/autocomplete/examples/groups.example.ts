import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAutocomplete } from '@tectra/ui/autocomplete';

@Component({
  selector: 'autocomplete-groups-example',
  imports: [TxAutocomplete],
  template: `<tx-autocomplete
    [suggestions]="cars"
    [group]="true"
    [optionGroupLabel]="'brand'"
    [optionGroupChildren]="'models'"
    [localSearch]="true"
    [dropdown]="true"
    [delay]="0"
    [placeholder]="'Model'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteGroupsExample {
  readonly cars = [
    { brand: 'Compact', models: ['City', 'Mini', 'Spark'] },
    { brand: 'Family', models: ['Estate', 'Tourer', 'Van'] },
    { brand: 'Sport', models: ['Coupe', 'Roadster'] },
  ];
}
