import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountry } from '@tectra-ng/ui/country';

@Component({
  selector: 'country-custom-name-example',
  imports: [TxCountry],
  template: `
    <div class="stack">
      <tx-country [country]="'GB'" [name]="'United Kingdom'" />
      <tx-country [country]="'EU'" />
      <tx-country [country]="'Worldwide'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountryCustomNameExample {}
