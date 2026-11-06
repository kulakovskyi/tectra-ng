import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxExport, TxExportField } from '@tectra-ng/ui/export';
import { TxToastService } from '@tectra-ng/ui/toast';

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
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportServerExample {
  readonly cancel = signal(false);
  private readonly toast = inject(TxToastService);
  readonly fields: TxExportField<Order>[] = [
    { field: 'id', title: 'Order' },
    { field: 'status', title: 'Status' },
    { field: 'total', title: 'Total, EUR' },
  ];

  readonly loadAll = async (): Promise<Order[] | null> => {
    const progress = this.toast.loading('Loading 240 orders…');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (this.cancel()) {
      progress.update({ severity: 'info', text: 'Cancelled — nothing was exported' });
      return null;
    }
    progress.update({ severity: 'success', text: 'Exported 240 orders' });
    return Array.from({ length: 240 }, (_, index) => ({
      id: 5000 + index,
      status: ['Paid', 'Shipped', 'Refunded'][index % 3],
      total: Math.round((20 + ((index * 37) % 400)) * 100) / 100,
    }));
  };
}
