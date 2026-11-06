import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxExport, TxExportField, TxExportedEvent } from '@tectra-ng/ui/export';

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
    <p class="hint" aria-live="polite">{{ last() }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .hint {
      margin: 12px 0 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportMenuExample {
  readonly last = signal('The main button saves Excel; the arrow opens every format.');
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
    this.last.set(event.filename ? `Saved ${event.filename}.` : `Done: ${event.format}.`);
  }
}
