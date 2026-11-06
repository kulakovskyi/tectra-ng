import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAutocomplete, TxAutocompleteCompleteEvent } from '@tectra-ng/ui/autocomplete';

interface Repository {
  name: string;
  stars: number;
}

const REPOSITORIES: Repository[] = Array.from({ length: 300 }, (_, index) => ({
  name: `project-${['alpha', 'beta', 'gamma', 'delta', 'omega'][index % 5]}-${index + 1}`,
  stars: (index * 37) % 1000,
}));

@Component({
  selector: 'autocomplete-server-example',
  imports: [TxAutocomplete],
  template: `<tx-autocomplete
    [suggestions]="results()"
    [optionLabel]="'name'"
    [optionValue]="'name'"
    [loading]="loading()"
    [minLength]="2"
    [delay]="300"
    [placeholder]="'Repository — type 2 letters'"
    (completed)="search($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteServerExample {
  readonly results = signal<Repository[]>([]);
  readonly loading = signal(false);

  search(event: TxAutocompleteCompleteEvent): void {
    this.loading.set(true);
    setTimeout(() => {
      this.results.set(
        REPOSITORIES.filter((repository) =>
          repository.name.includes(event.query.toLowerCase()),
        ).slice(0, 20),
      );
      this.loading.set(false);
    }, 500);
  }
}
