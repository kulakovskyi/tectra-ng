import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountry } from '@tectra-ng/ui/country';

@Component({
  selector: 'country-flag-only-example',
  imports: [TxCountry],
  template: `
    <div class="flex">
      @for (code of codes; track code) {
        <tx-country [country]="code" [showName]="false" [size]="'medium'" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountryFlagOnlyExample {
  readonly codes = ['FR', 'IT', 'ES', 'PT', 'NL', 'SE'];
}
