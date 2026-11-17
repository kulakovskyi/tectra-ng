import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCountryOption, TxCountrySelect } from '@tectra-ng/ui/country-select';

@Component({
  selector: 'country-select-other-options-example',
  imports: [TxCountrySelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-country-select
        [formControl]="origin"
        [options]="options"
        [sort]="'none'"
        [placeholder]="'Origin'"
      />
      <span class="hint">Value: {{ origin.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountrySelectOtherOptionsExample {
  readonly origin = new FormControl<string | null>('none');
  readonly options: (string | TxCountryOption)[] = [
    { code: 'none', label: 'Not set' },
    'UA',
    'PL',
    'EU',
    { code: 'ZZ', label: 'Other' },
  ];
}
