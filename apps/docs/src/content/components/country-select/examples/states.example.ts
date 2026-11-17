import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxCountrySelect } from '@tectra-ng/ui/country-select';

@Component({
  selector: 'country-select-states-example',
  imports: [TxCountrySelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-country-select [size]="'small'" [placeholder]="'Small'" />
      <tx-country-select [variant]="'filled'" [placeholder]="'Filled'" />
      <tx-country-select [formControl]="locked" [ariaLabel]="'Disabled'" />
      <tx-country-select [formControl]="shown" [readonly]="true" [ariaLabel]="'Read only'" />
      <tx-country-select
        [formControl]="required"
        [placeholder]="'Required'"
        [ariaLabel]="'Required'"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountrySelectStatesExample {
  readonly locked = new FormControl({ value: 'FI', disabled: true });
  readonly shown = new FormControl('SE');
  readonly required = new FormControl<string | null>(null, Validators.required);

  constructor() {
    this.required.markAsTouched();
  }
}
