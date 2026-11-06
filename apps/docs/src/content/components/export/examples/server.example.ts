import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxExport, TxExportField } from '@tectra-ng/ui/export';

interface Order {
  id: number;
  status: string;
  total: number;
}

@Component({
  selector: 'export-server-example',
  imports: [FormsModule, TxExport, TxCheckbox],
  template: `
    <div class="row">
      <tx-export filename="orders" title="All orders" [fields]="fields" [fetchData]="loadAll" />
      <tx-checkbox
        label="Cancel the next export"
        [binary]="true"
        [ngModel]="cancel()"
        (ngModelChange)="cancel.set($event)"
      />
    </div>
    <p class="hint" aria-live="polite">{{ status() }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
    .hint {
      margin: 12px 0 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportServerExample {
  readonly cancel = signal(false);
  readonly status = signal('Every page of 240 orders is loaded on click.');
  readonly fields: TxExportField<Order>[] = [
    { field: 'id', title: 'Order' },
    { field: 'status', title: 'Status' },
    { field: 'total', title: 'Total, EUR' },
  ];

  readonly loadAll = async (): Promise<Order[] | null> => {
    this.status.set('Loading 240 orders…');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (this.cancel()) {
      this.status.set('Cancelled — nothing was exported.');
      return null;
    }
    this.status.set('Exported 240 orders.');
    return Array.from({ length: 240 }, (_, index) => ({
      id: 5000 + index,
      status: ['Paid', 'Shipped', 'Refunded'][index % 3],
      total: Math.round((20 + ((index * 37) % 400)) * 100) / 100,
    }));
  };
}
