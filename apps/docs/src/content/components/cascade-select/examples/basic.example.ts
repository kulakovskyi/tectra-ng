import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCascadeSelect } from '@tectra-ng/ui/cascade-select';

@Component({
  selector: 'cascade-select-basic-example',
  imports: [TxCascadeSelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-cascade-select
        [options]="places"
        [formControl]="office"
        [optionLabel]="'city'"
        [optionValue]="'code'"
        [optionGroupLabel]="'name'"
        [optionGroupChildren]="['regions', 'cities']"
        [optionDisabled]="'closed'"
        [placeholder]="'Office'"
      />
      <span class="hint">Value: {{ office.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CascadeSelectBasicExample {
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
  readonly office = new FormControl<string | null>(null);
}
