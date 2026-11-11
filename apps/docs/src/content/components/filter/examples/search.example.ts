import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';
import { TxSearchPipe } from '@tectra-ng/utils/filter';

@Component({
  selector: 'filter-search-example',
  imports: [FormsModule, TxIconField, TxInputIcon, TxInput, TxTable, TxSearchPipe],
  template: `
    <div class="layout">
      <tx-icon-field class="search">
        <tx-input-icon icon="search" />
        <input txInput placeholder="Search people" aria-label="Search people" [(ngModel)]="query" />
      </tx-icon-field>
      <tx-table
        ariaLabel="People"
        dataKey="id"
        [value]="people | txSearch: query() : ['name', 'email', 'team.name']"
        [columns]="columns"
      />
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .search {
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FilterSearchExample {
  readonly query = signal('');
  readonly people = [
    { id: 1, name: 'Zoë Novák', email: 'zoe@example.com', team: { name: 'Design' } },
    { id: 2, name: 'Ann Lee', email: 'ann@example.com', team: { name: 'Platform' } },
    { id: 3, name: 'Mark Ivanenko', email: 'mark@example.com', team: { name: 'Sales' } },
    { id: 4, name: 'Olena Kovalenko', email: 'olena@example.com', team: { name: 'Design' } },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'team.name', header: 'Team' },
  ];
}
