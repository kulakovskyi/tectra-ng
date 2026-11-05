import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountry } from '@tectra/ui/country';

@Component({
  selector: 'country-sizes-example',
  imports: [TxCountry],
  template: `
    <div class="flex">
      <tx-country [country]="'CA'" [size]="'small'" />
      <tx-country [country]="'CA'" [size]="'medium'" />
      <tx-country [country]="'CA'" [size]="'large'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountrySizesExample {}
