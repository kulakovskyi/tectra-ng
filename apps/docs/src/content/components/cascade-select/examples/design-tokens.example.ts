import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCascadeSelect } from '@tectra-ng/ui/cascade-select';

@Component({
  selector: 'cascade-select-design-tokens-example',
  imports: [TxCascadeSelect],
  template: `<tx-cascade-select
    [options]="places"
    [optionLabel]="'city'"
    [optionValue]="'code'"
    [optionGroupLabel]="'name'"
    [optionGroupChildren]="['regions', 'cities']"
    [placeholder]="'Office'"
    [dt]="{ root: { columnWidth: '160px', columnBorderColor: 'transparent' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CascadeSelectDesignTokensExample {
  readonly places = [
    {
      name: 'Ukraine',
      regions: [
        {
          name: 'Kyiv region',
          cities: [
            { city: 'Kyiv', code: 'UA-KYI' },
            { city: 'Bila Tserkva', code: 'UA-BTS' },
          ],
        },
        {
          name: 'Lviv region',
          cities: [
            { city: 'Lviv', code: 'UA-LWO' },
            { city: 'Stryi', code: 'UA-STR' },
          ],
        },
      ],
    },
    {
      name: 'Poland',
      regions: [
        {
          name: 'Masovia',
          cities: [
            { city: 'Warsaw', code: 'PL-WAW' },
            { city: 'Radom', code: 'PL-RDO' },
          ],
        },
        { name: 'Lesser Poland', cities: [{ city: 'Kraków', code: 'PL-KRK' }] },
      ],
    },
    {
      name: 'Germany',
      regions: [
        {
          name: 'Bavaria',
          cities: [
            { city: 'Munich', code: 'DE-MUC' },
            { city: 'Nuremberg', code: 'DE-NUE', closed: true },
          ],
        },
      ],
    },
  ];
}
