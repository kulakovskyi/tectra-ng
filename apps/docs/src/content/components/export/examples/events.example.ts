import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxExportCsv, TxExportField, TxExportedEvent } from '@tectra-ng/ui/export';

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
        (failed)="log.set('The server did not answer — try again.')"
      />
    </div>
    <p class="hint" aria-live="polite">{{ log() }}</p>
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
export default class ExportEventsExample {
  readonly log = signal('Nothing exported yet.');
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
    this.log.set(`Saved ${event.rows} rows to ${event.filename}.`);
  }
}
