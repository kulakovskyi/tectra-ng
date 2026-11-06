import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxTable, TxTableColumn, TxTableEmpty } from '@tectra-ng/ui/table';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

interface Invoice {
  id: number;
  number: string;
  client: string;
  city: string;
  amount: number;
  status: string;
}

const INVOICES: Invoice[] = [
  {
    id: 1,
    number: 'INV-1042',
    client: 'Northwind Studio',
    city: 'Lviv',
    amount: 1280,
    status: 'Paid',
  },
  {
    id: 2,
    number: 'INV-1043',
    client: 'Blue Harbor',
    city: 'Kyiv',
    amount: 640,
    status: 'Pending',
  },
  {
    id: 3,
    number: 'INV-1044',
    client: 'Oakline Partners',
    city: 'Odesa',
    amount: 3920,
    status: 'Overdue',
  },
  { id: 4, number: 'INV-1045', client: 'Silverleaf', city: 'Kharkiv', amount: 215, status: 'Paid' },
];

@Component({
  selector: 'table-states-example',
  imports: [TxTable, TxTableEmpty, TxToggleSwitch, FormsModule],
  template: `
    <tx-toggle-switch label="Loading" [(ngModel)]="loading" />
    <tx-table
      ariaLabel="Invoices"
      dataKey="id"
      [loading]="loading()"
      [value]="invoices"
      [columns]="columns"
    />
    <tx-table ariaLabel="Archived invoices" [value]="[]" [columns]="columns">
      <ng-template txTableEmpty>No archived invoices yet.</ng-template>
    </tx-table>
  `,
  styles: `
    :host {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableStatesExample {
  readonly invoices = INVOICES;
  readonly loading = signal(true);
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice' },
    { field: 'client', header: 'Client', initialWidth: '180px' },
    { field: 'city', header: 'City' },
    { field: 'amount', header: 'Amount', align: 'end' },
  ];
}
