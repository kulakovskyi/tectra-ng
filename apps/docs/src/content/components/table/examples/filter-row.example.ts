import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxIconField, TxInputIcon } from '@tectra/ui/icon-field';
import { TxTable, TxTableColumn } from '@tectra/ui/table';

interface Invoice {
  id: number;
  number: string;
  client: string;
  city: string;
  amount: number;
  status: string;
  issued: Date;
  paid: boolean;
}

const INVOICES: Invoice[] = [
  {
    id: 1,
    number: 'INV-1042',
    client: 'Northwind Studio',
    city: 'Lviv',
    amount: 1280,
    status: 'Paid',
    issued: new Date(2026, 9, 2),
    paid: true,
  },
  {
    id: 2,
    number: 'INV-1043',
    client: 'Blue Harbor',
    city: 'Kyiv',
    amount: 640,
    status: 'Pending',
    issued: new Date(2026, 9, 4),
    paid: false,
  },
  {
    id: 3,
    number: 'INV-1044',
    client: 'Oakline Partners',
    city: 'Odesa',
    amount: 3920,
    status: 'Overdue',
    issued: new Date(2026, 9, 7),
    paid: false,
  },
  {
    id: 4,
    number: 'INV-1045',
    client: 'Silverleaf',
    city: 'Kharkiv',
    amount: 215,
    status: 'Paid',
    issued: new Date(2026, 9, 11),
    paid: true,
  },
  {
    id: 5,
    number: 'INV-1046',
    client: 'Maple & Co',
    city: 'Dnipro',
    amount: 1870,
    status: 'Pending',
    issued: new Date(2026, 9, 15),
    paid: false,
  },
  {
    id: 6,
    number: 'INV-1047',
    client: 'Granite Works',
    city: 'Kyiv',
    amount: 760,
    status: 'Paid',
    issued: new Date(2026, 9, 18),
    paid: true,
  },
];

@Component({
  selector: 'table-filter-row-example',
  imports: [TxTable, TxInput, TxIconField, TxInputIcon],
  template: `
    <tx-table
      ariaLabel="Invoices"
      dataKey="id"
      filterDisplay="row"
      toolbar
      [value]="invoices"
      [columns]="columns"
      [(globalFilter)]="search"
    >
      <tx-icon-field txTableToolbar>
        <tx-input-icon icon="search" />
        <input
          txInput
          type="search"
          placeholder="Search invoices"
          aria-label="Search invoices"
          [value]="search()"
          (input)="search.set($any($event.target).value)"
        />
      </tx-icon-field>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableFilterRowExample {
  readonly invoices = INVOICES;
  readonly search = signal('');
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice', filter: true },
    { field: 'client', header: 'Client', initialWidth: '180px', filter: true },
    { field: 'city', header: 'City', filter: true },
    { field: 'amount', header: 'Amount', align: 'end', filter: true, filterType: 'numeric' },
  ];
}
