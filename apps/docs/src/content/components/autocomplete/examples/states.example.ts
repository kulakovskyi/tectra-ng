import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxAutocomplete } from '@tectra/ui/autocomplete';

@Component({
  selector: 'autocomplete-states-example',
  imports: [TxAutocomplete, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-autocomplete
        [suggestions]="tags"
        [localSearch]="true"
        [size]="'small'"
        [placeholder]="'Small'"
      />
      <tx-autocomplete
        [suggestions]="tags"
        [localSearch]="true"
        [variant]="'filled'"
        [placeholder]="'Filled'"
      />
      <tx-autocomplete [suggestions]="tags" [invalid]="true" [placeholder]="'Invalid'" />
      <tx-autocomplete [suggestions]="tags" [formControl]="locked" [ariaLabel]="'Disabled'" />
      <tx-autocomplete
        [suggestions]="tags"
        [formControl]="shown"
        [readonly]="true"
        [ariaLabel]="'Read only'"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteStatesExample {
  readonly tags = ['urgent', 'review', 'design', 'backend'];
  readonly locked = new FormControl({ value: 'design', disabled: true });
  readonly shown = new FormControl('review');
}
