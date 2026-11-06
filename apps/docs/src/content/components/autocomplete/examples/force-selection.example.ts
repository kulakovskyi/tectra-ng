import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxAutocomplete } from '@tectra-ng/ui/autocomplete';

@Component({
  selector: 'autocomplete-force-selection-example',
  imports: [TxAutocomplete, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-autocomplete
        [suggestions]="countries"
        [formControl]="country"
        [optionLabel]="'name'"
        [optionValue]="'code'"
        [localSearch]="true"
        [filterMatchMode]="'startsWith'"
        [forceSelection]="true"
        [autoOptionFocus]="true"
        [delay]="0"
        [placeholder]="'Country'"
      />
      <span class="hint">Value: {{ country.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteForceSelectionExample {
  readonly countries = [
    { name: 'Austria', code: 'AT' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Canada', code: 'CA' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Estonia', code: 'EE' },
    { name: 'France', code: 'FR' },
    { name: 'Germany', code: 'DE' },
    { name: 'Ukraine', code: 'UA' },
  ];
  readonly country = new FormControl<string | null>(null);
}
