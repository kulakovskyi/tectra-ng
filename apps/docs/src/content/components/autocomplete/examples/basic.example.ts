import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxAutocomplete, TxAutocompleteCompleteEvent } from '@tectra-ng/ui/autocomplete';

const FRUITS = [
  'Apple',
  'Apricot',
  'Banana',
  'Blackberry',
  'Blueberry',
  'Cherry',
  'Grape',
  'Lemon',
  'Mango',
  'Peach',
  'Pear',
  'Plum',
];

@Component({
  selector: 'autocomplete-basic-example',
  imports: [TxAutocomplete, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-autocomplete
        [suggestions]="suggestions()"
        [formControl]="fruit"
        [placeholder]="'Fruit'"
        (completed)="search($event)"
      />
      <span class="hint">Value: {{ fruit.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteBasicExample {
  readonly suggestions = signal<string[]>([]);
  readonly fruit = new FormControl<string | null>(null);

  search(event: TxAutocompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.suggestions.set(FRUITS.filter((fruit) => fruit.toLowerCase().includes(query)));
  }
}
