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
  selector: 'table-design-tokens-example',
  imports: [TxTable],
  template: `<tx-table
    ariaLabel="Invoices"
    [value]="invoices"
    [columns]="columns"
    [dt]="tokens"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableDesignTokensExample {
  readonly invoices = INVOICES;
  readonly tokens = {
    headerCell: {
      background: 'var(--tx-highlight-background)',
      color: 'var(--tx-highlight-color)',
    },
    bodyCell: { height: '56px' },
  };
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice' },
    { field: 'client', header: 'Client', initialWidth: '180px' },
    { field: 'city', header: 'City' },
    { field: 'amount', header: 'Amount', align: 'end' },
  ];
}
