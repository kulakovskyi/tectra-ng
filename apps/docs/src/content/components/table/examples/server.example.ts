import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTable, TxTableColumn, TxTableLazyLoadEvent, sortRows } from '@tectra/ui/table';

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
const SERVER: Order[] = Array.from({ length: 237 }, (_, index) => ({
  id: index + 1,
  number: `ORD-${String(index + 1).padStart(4, '0')}`,
  customer: CUSTOMERS[(index * 7) % CUSTOMERS.length],
  total: ((index * 53) % 1900) + 25,
}));

@Component({
  selector: 'table-server-example',
  imports: [TxTable],
  template: `<tx-table
    ariaLabel="Orders"
    dataKey="id"
    lazy
    paginator
    showTotal
    [value]="page()"
    [columns]="columns"
    [totalRecords]="total"
    [loading]="loading()"
    [rows]="5"
    [rowsPerPageOptions]="[5, 10, 50]"
    (lazyLoad)="load($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableServerExample {
  readonly total = SERVER.length;
  readonly page = signal(SERVER.slice(0, 5));
  readonly loading = signal(false);
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Order' },
    { field: 'customer', header: 'Customer', initialWidth: '200px' },
    { field: 'total', header: 'Total', align: 'end' },
  ];

  load({ first, rows, sortField, sortOrder }: TxTableLazyLoadEvent): void {
    this.loading.set(true);
    setTimeout(() => {
      const sorted =
        sortField && sortOrder
          ? sortRows(SERVER, [{ field: sortField, order: sortOrder }])
          : SERVER;
      this.page.set(sorted.slice(first, first + rows));
      this.loading.set(false);
    }, 500);
  }
}
