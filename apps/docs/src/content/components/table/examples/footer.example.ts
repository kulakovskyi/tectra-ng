import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableColumn, TxTableFooterCell } from '@tectra/ui/table';

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
  {
    id: 5,
    number: 'INV-1046',
    client: 'Maple & Co',
    city: 'Dnipro',
    amount: 1870,
    status: 'Pending',
  },
  { id: 6, number: 'INV-1047', client: 'Granite Works', city: 'Kyiv', amount: 760, status: 'Paid' },
];

@Component({
  selector: 'table-footer-example',
  imports: [TxTable, TxTableFooterCell],
  template: `
    <tx-table ariaLabel="Invoices" dataKey="id" [value]="invoices" [columns]="columns">
      <ng-template txTableFooterCell="amount">{{ total }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableFooterExample {
  readonly invoices = INVOICES;
  readonly total = INVOICES.reduce((sum, invoice) => sum + invoice.amount, 0);
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice', footer: 'Total' },
    { field: 'client', header: 'Client', initialWidth: '180px' },
    { field: 'city', header: 'City' },
    { field: 'amount', header: 'Amount', align: 'end' },
  ];
}
