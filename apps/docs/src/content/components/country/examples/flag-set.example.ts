import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountry } from '@tectra-ng/ui/country';

@Component({
  selector: 'country-flag-set-example',
  imports: [TxCountry],
  template: `
    <div class="flex">
      @for (code of codes; track code) {
        <tx-country [country]="code" [showName]="false" [size]="'large'" />
      }
    </div>
    <div class="flex">
      @for (code of codes; track code) {
        <tx-country [country]="code" [showName]="false" [size]="'large'" [shape]="'circle'" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountryFlagSetExample {
  readonly codes = ['UA', 'GB', 'US', 'BR', 'JP', 'ZA', 'MX', 'IN'];
}
