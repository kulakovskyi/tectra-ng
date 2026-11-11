import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';
import { TxDebounceInput } from '@tectra-ng/utils/debounce-input';

const CITIES = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro', 'Lutsk', 'Uzhhorod', 'Poltava'].map(
  (name, id) => ({ id, name }),
);

@Component({
  selector: 'debounce-input-basic-example',
  imports: [TxInput, TxTable, TxDebounceInput],
  template: `
    <div class="layout">
      <input
        txInput
        txDebounceInput
        [debounceTime]="400"
        placeholder="Search cities"
        aria-label="Search cities"
        (debounceValue)="search($event)"
      />
      <span class="hint">Searches run: {{ runs() }} · query “{{ query() }}”</span>
      <tx-table ariaLabel="Cities" dataKey="id" [value]="cities()" [columns]="columns" />
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DebounceInputBasicExample {
  readonly query = signal('');
  readonly runs = signal(0);
  readonly cities = computed(() =>
    CITIES.filter((city) => city.name.toLowerCase().includes(this.query().trim().toLowerCase())),
  );
  readonly columns: TxTableColumn[] = [{ field: 'name', header: 'City' }];

  search(value: string): void {
    this.query.set(value);
    this.runs.update((runs) => runs + 1);
  }
}
