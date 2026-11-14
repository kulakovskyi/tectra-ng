import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { TxPaginator } from '@tectra-ng/ui/paginator';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';
import { txFilterState } from '@tectra-ng/utils/filter-state';

const ROWS = 8;
const ORDERS = Array.from({ length: 64 }, (_, index) => ({
  id: 1001 + index,
  customer: ['Northwind', 'Blue Harbor', 'Greenfield', 'Summit Supply'][index % 4],
  total: 40 + ((index * 37) % 400),
}));

@Component({
  selector: 'scrolling-list-page-example',
  imports: [TxPaginator, TxTable],
  template: `
    <div class="column">
      <tx-table ariaLabel="Orders" dataKey="id" [value]="page()" [columns]="columns" />
      <tx-paginator
        [totalRecords]="orders.length"
        [rows]="rows"
        [first]="(filters.value().page - 1) * rows"
        (pageChange)="filters.patch({ page: $event.page + 1 })"
      />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScrollingListPageExample {
  readonly rows = ROWS;
  readonly orders = ORDERS;
  readonly columns: TxTableColumn[] = [
    { field: 'id', header: 'Order' },
    { field: 'customer', header: 'Customer' },
    { field: 'total', header: 'Total' },
  ];
  readonly filters = txFilterState({
    key: 'docs-scrolling-orders',
    initial: { page: 1 },
    url: true,
    storage: false,
  });
  readonly page = computed(() => {
    const start = (this.filters.value().page - 1) * ROWS;
    return ORDERS.slice(start, start + ROWS);
  });
}
