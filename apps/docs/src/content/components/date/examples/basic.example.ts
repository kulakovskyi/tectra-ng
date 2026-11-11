import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TX_DATE_FORMATS, TxDatePipe } from '@tectra-ng/utils/date';

interface Order {
  id: number;
  number: string;
  created: string;
  shipped: string | null;
}

@Component({
  selector: 'date-basic-example',
  imports: [TxTable, TxTableCell, TxDatePipe],
  template: `
    <tx-table ariaLabel="Orders" dataKey="id" [value]="orders" [columns]="columns">
      <ng-template txTableCell="created" let-value="value">{{
        value | txDate: formats.dateTime
      }}</ng-template>
      <ng-template txTableCell="shipped" let-value="value">{{ value | txDate }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DateBasicExample {
  readonly formats = TX_DATE_FORMATS;
  readonly orders: Order[] = [
    { id: 1, number: 'SO-2041', created: '2026-11-09T08:14:00', shipped: '2026-11-10T16:40:00' },
    { id: 2, number: 'SO-2042', created: '2026-11-10T12:02:00', shipped: null },
    { id: 3, number: 'SO-2043', created: '2026-11-11T09:47:00', shipped: 'not shipped yet' },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Order' },
    { field: 'created', header: 'Created' },
    { field: 'shipped', header: 'Shipped' },
  ];
}
