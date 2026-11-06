import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxExport, TxExportField, TxExportedEvent } from '@tectra-ng/ui/export';
import { TxToastService } from '@tectra-ng/ui/toast';

interface Order {
  id: number;
  status: string;
  total: number;
}

@Component({
  selector: 'export-menu-example',
  imports: [TxExport],
  template: `
    <div class="row">
      <tx-export
        filename="orders"
        title="Orders"
        [data]="orders"
        [fields]="fields"
        (exported)="onExported($event)"
      />
      <tx-export
        label="Spreadsheets"
        variant="outlined"
        filename="orders"
        [formats]="['excel', 'csv', 'copy']"
        [data]="orders"
        [fields]="fields"
        (exported)="onExported($event)"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportMenuExample {
  private readonly toast = inject(TxToastService);
  readonly fields: TxExportField<Order>[] = [
    { field: 'id', title: 'Order' },
    { field: 'status', title: 'Status' },
    { field: 'total', title: 'Total, EUR' },
  ];
  readonly orders: Order[] = [
    { id: 5001, status: 'Paid', total: 120 },
    { id: 5002, status: 'Shipped', total: 75.5 },
    { id: 5003, status: 'Refunded', total: 42 },
  ];

  onExported(event: TxExportedEvent<Order>): void {
    if (event.filename) this.toast.success(`Saved ${event.filename}`);
    else if (event.format === 'copy') this.toast.success('Orders copied');
    else this.toast.info('Sent to the printer');
  }
}
