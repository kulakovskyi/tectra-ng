import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxAutocomplete, TxAutocompleteCompleteEvent } from '@tectra-ng/ui/autocomplete';

const PEOPLE = [
  'olena@example.com',
  'taras@example.com',
  'iryna@example.com',
  'mykola@example.com',
  'sofia@example.com',
];

@Component({
  selector: 'autocomplete-multiple-example',
  imports: [TxAutocomplete, ReactiveFormsModule],
  template: `<tx-autocomplete
    [suggestions]="suggestions()"
    [formControl]="recipients"
    [multiple]="true"
    [delay]="100"
    [placeholder]="'Recipients'"
    (completed)="search($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteMultipleExample {
  readonly suggestions = signal<string[]>([]);
  readonly recipients = new FormControl<string[]>(['olena@example.com']);

  search(event: TxAutocompleteCompleteEvent): void {
    this.suggestions.set(PEOPLE.filter((email) => email.includes(event.query.toLowerCase())));
  }
}
