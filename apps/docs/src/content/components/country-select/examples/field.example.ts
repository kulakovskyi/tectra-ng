import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxCountrySelect } from '@tectra/ui/country-select';
import { TxField } from '@tectra/ui/field';

@Component({
  selector: 'country-select-field-example',
  imports: [TxCountrySelect, TxField, ReactiveFormsModule],
  template: `
    <tx-field [label]="'Country of residence'" [hint]="'Used for taxes'">
      <tx-country-select [formControl]="country" />
    </tx-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountrySelectFieldExample {
  readonly country = new FormControl<string | null>(null, Validators.required);
}
