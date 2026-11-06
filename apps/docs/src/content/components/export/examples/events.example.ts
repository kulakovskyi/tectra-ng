import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxExportCsv, TxExportField, TxExportedEvent } from '@tectra-ng/ui/export';
import { TxToastService } from '@tectra-ng/ui/toast';

interface Row {
  sku: string;
  stock: number;
}

@Component({
  selector: 'export-events-example',
  imports: [TxExportCsv],
  template: `
    <div class="row">
      <tx-export-csv
        label="Export stock"
        [data]="rows"
        [fields]="fields"
        (exported)="onExported($event)"
      />
      <tx-export-csv
        label="Export (fails)"
        variant="outlined"
        severity="danger"
        [fields]="fields"
        [fetchData]="broken"
        (failed)="toast.error('The server did not answer — try again')"
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
export default class ExportEventsExample {
  readonly toast = inject(TxToastService);
  readonly fields: TxExportField<Row>[] = [
    { field: 'sku', title: 'SKU' },
    { field: 'stock', title: 'Stock' },
  ];
  readonly rows: Row[] = [
    { sku: 'DESK-OAK', stock: 12 },
    { sku: 'LAMP-01', stock: 48 },
  ];
  readonly broken = (): Promise<Row[]> =>
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 600));

  onExported(event: TxExportedEvent<Row>): void {
    this.toast.success(`Saved ${event.rows} rows to ${event.filename}`);
  }
}
