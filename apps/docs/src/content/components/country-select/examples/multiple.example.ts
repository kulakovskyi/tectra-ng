import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCountrySelect } from '@tectra/ui/country-select';

@Component({
  selector: 'country-select-multiple-example',
  imports: [TxCountrySelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-country-select [formControl]="markets" [multiple]="true" [placeholder]="'Markets'" />
      <span class="hint">Value: {{ markets.value?.join(', ') || '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountrySelectMultipleExample {
  readonly markets = new FormControl<string[]>(['DE', 'FR', 'IT', 'ES', 'PL']);
}
