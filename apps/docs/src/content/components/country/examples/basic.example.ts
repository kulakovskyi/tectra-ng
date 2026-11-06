import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountry } from '@tectra-ng/ui/country';

@Component({
  selector: 'country-basic-example',
  imports: [TxCountry],
  template: `
    <div class="stack">
      @for (code of codes; track code) {
        <tx-country [country]="code" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountryBasicExample {
  readonly codes = ['ua', 'PL', 'DE', 'JP', 'BR'];
}
