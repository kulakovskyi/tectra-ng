import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxButton } from '@tectra-ng/ui/button';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxTable, TxTableColumn, TxTableEmpty } from '@tectra-ng/ui/table';

const CITIES = [
  { id: 1, city: 'Kyiv', region: 'Kyiv', population: '2 950 000' },
  { id: 2, city: 'Kharkiv', region: 'Kharkiv', population: '1 420 000' },
  { id: 3, city: 'Odesa', region: 'Odesa', population: '1 010 000' },
  { id: 4, city: 'Dnipro', region: 'Dnipro', population: '968 000' },
  { id: 5, city: 'Lviv', region: 'Lviv', population: '717 000' },
  { id: 6, city: 'Vinnytsia', region: 'Vinnytsia', population: '370 000' },
];

@Component({
  selector: 'empty-state-no-results-example',
  imports: [
    FormsModule,
    TxEmptyState,
    TxButton,
    TxIconField,
    TxInputIcon,
    TxInputClear,
    TxInput,
    TxTable,
    TxTableEmpty,
  ],
  template: `
    <div class="column">
      <tx-icon-field class="search">
        <tx-input-icon icon="search" />
        <input
          txInput
          type="search"
          aria-label="Search cities"
          placeholder="Search cities"
          [(ngModel)]="query"
        />
        <tx-input-clear />
      </tx-icon-field>
      <tx-table
        ariaLabel="Cities"
        dataKey="id"
        [value]="cities"
        [columns]="columns"
        [(globalFilter)]="query"
      >
        <ng-template txTableEmpty>
          <tx-empty-state
            icon="search"
            tone="neutral"
            title="No cities found"
            [text]="'Nothing matches “' + query() + '”. Check the spelling or clear the search.'"
          >
            <button txButton severity="secondary" outlined icon="times" (click)="query.set('')">
              Clear search
            </button>
          </tx-empty-state>
        </ng-template>
      </tx-table>
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .search {
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmptyStateNoResultsExample {
  readonly cities = CITIES;
  readonly columns: TxTableColumn[] = [
    { field: 'city', header: 'City' },
    { field: 'region', header: 'Region' },
    { field: 'population', header: 'Population' },
  ];
  readonly query = signal('Paris');
}
