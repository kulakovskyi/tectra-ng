import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCountrySelect } from '@tectra-ng/ui/country-select';

@Component({
  selector: 'country-select-basic-example',
  imports: [TxCountrySelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-country-select [formControl]="country" [placeholder]="'Country'" [showClear]="true" />
      <span class="hint">Value: {{ country.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountrySelectBasicExample {
  readonly country = new FormControl<string | null>('UA');
}
