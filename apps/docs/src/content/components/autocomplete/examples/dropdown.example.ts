import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxAutocomplete } from '@tectra-ng/ui/autocomplete';

@Component({
  selector: 'autocomplete-dropdown-example',
  imports: [TxAutocomplete, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-autocomplete
        [suggestions]="units"
        [formControl]="unit"
        [dropdown]="true"
        [localSearch]="true"
        [delay]="0"
        [placeholder]="'Unit'"
      />
      <span class="hint">Value: {{ unit.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteDropdownExample {
  readonly units = [
    'pieces',
    'kilograms',
    'grams',
    'litres',
    'millilitres',
    'metres',
    'centimetres',
    'boxes',
  ];
  readonly unit = new FormControl<string | null>('pieces');
}
