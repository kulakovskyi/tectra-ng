import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableColumn } from '@tectra/ui/table';

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
  selector: 'table-appearance-example',
  imports: [TxTable],
  template: `
    <tx-table
      ariaLabel="Small striped invoices"
      size="small"
      stripedRows
      [value]="invoices"
      [columns]="columns"
    />
    <tx-table
      ariaLabel="Large invoices without grid lines"
      size="large"
      [showGridlines]="false"
      [value]="invoices"
      [columns]="columns"
    />
  `,
  styles: `
    :host {
      display: grid;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableAppearanceExample {
  readonly invoices = INVOICES;
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice' },
    { field: 'client', header: 'Client', initialWidth: '180px' },
    { field: 'city', header: 'City' },
    { field: 'amount', header: 'Amount', align: 'end' },
  ];
}
