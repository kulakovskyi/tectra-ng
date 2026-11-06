import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTable, TxTableColumn } from '@tectra/ui/table';

interface Order {
  id: number;
  number: string;
  customer: string;
  total: number;
}

const CUSTOMERS = [
  'Northwind Studio',
  'Blue Harbor',
  'Oakline Partners',
  'Silverleaf',
  'Maple & Co',
  'Granite Works',
];
const ORDERS: Order[] = Array.from({ length: 64 }, (_, index) => ({
  id: index + 1,
  number: `ORD-${String(index + 1).padStart(4, '0')}`,
  customer: CUSTOMERS[index % CUSTOMERS.length],
  total: ((index * 37) % 900) + 40,
}));

@Component({
  selector: 'table-pagination-example',
  imports: [TxTable],
  template: `<tx-table
    ariaLabel="Orders"
    dataKey="id"
    paginator
    showTotal
    [value]="orders"
    [columns]="columns"
    [(first)]="first"
    [(rows)]="rows"
    [rowsPerPageOptions]="[5, 10, 50, 100]"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TablePaginationExample {
  readonly orders = ORDERS;
  readonly first = signal(0);
  readonly rows = signal(5);
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Order' },
    { field: 'customer', header: 'Customer', initialWidth: '200px' },
    { field: 'total', header: 'Total', align: 'end' },
  ];
}
