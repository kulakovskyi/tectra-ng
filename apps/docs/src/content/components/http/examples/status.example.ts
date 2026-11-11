import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxTag } from '@tectra-ng/ui/tag';
import { TxHttpStatusLabelPipe, TxHttpStatusTonePipe } from '@tectra-ng/utils/http';

@Component({
  selector: 'http-status-example',
  imports: [TxTable, TxTableCell, TxTag, TxHttpStatusLabelPipe, TxHttpStatusTonePipe],
  template: `
    <tx-table ariaLabel="Health checks" dataKey="url" [value]="checks" [columns]="columns">
      <ng-template txTableCell="status" let-value="value">
        <tx-tag
          [value]="(value ?? '—') + ' · ' + (value | txHttpStatusLabel: warnCodes)"
          [severity]="value | txHttpStatusTone: warnCodes"
        />
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HttpStatusExample {
  readonly warnCodes = [299];
  readonly checks = [
    { url: '/', status: 200 },
    { url: '/old-pricing', status: 301 },
    { url: '/beta', status: 299 },
    { url: '/admin', status: 403 },
    { url: '/api/search', status: 503 },
    { url: '/status', status: null },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'url', header: 'Page' },
    { field: 'status', header: 'Status' },
  ];
}
