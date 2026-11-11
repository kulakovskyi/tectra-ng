import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';
import { txFilterState } from '@tectra-ng/utils/filter-state';

const TICKETS = [
  { id: 1, title: 'Login page is slow', status: 'Open', team: 'Platform' },
  { id: 2, title: 'Export misses a column', status: 'In progress', team: 'Data' },
  { id: 3, title: 'Typo in the invoice email', status: 'Done', team: 'Support' },
  { id: 4, title: 'Dark mode flicker', status: 'Open', team: 'Design' },
  { id: 5, title: 'Webhook retries twice', status: 'In progress', team: 'Platform' },
];

@Component({
  selector: 'filter-state-basic-example',
  imports: [FormsModule, TxButton, TxInput, TxMultiselect, TxTable],
  template: `
    <div class="layout">
      <div class="flex">
        <input
          txInput
          placeholder="Search tickets"
          aria-label="Search tickets"
          [ngModel]="filters.value().search"
          (ngModelChange)="filters.patch({ search: $event })"
        />
        <tx-multiselect
          ariaLabel="Status"
          placeholder="Status"
          [options]="statuses"
          [ngModel]="filters.value().status"
          (ngModelChange)="filters.patch({ status: $event })"
        />
        <button
          txButton
          label="Reset"
          severity="secondary"
          [badge]="filters.changed().length || undefined"
          [disabled]="filters.isInitial()"
          (click)="filters.reset()"
        ></button>
      </div>
      <tx-table ariaLabel="Tickets" dataKey="id" [value]="tickets()" [columns]="columns" />
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FilterStateBasicExample {
  readonly statuses = ['Open', 'In progress', 'Done'];
  readonly filters = txFilterState({
    key: 'docs-ticket-filters',
    initial: { search: '', status: [] as string[] },
  });
  readonly tickets = computed(() => {
    const { search, status } = this.filters.value();
    return TICKETS.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(search.trim().toLowerCase()) &&
        (!status.length || status.includes(ticket.status)),
    );
  });
  readonly columns: TxTableColumn[] = [
    { field: 'title', header: 'Ticket' },
    { field: 'status', header: 'Status' },
    { field: 'team', header: 'Team' },
  ];
}
