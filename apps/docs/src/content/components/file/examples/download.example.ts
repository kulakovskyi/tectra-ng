import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { downloadBlob } from '@tectra-ng/utils/file';

@Component({
  selector: 'file-download-example',
  imports: [TxButton],
  template: `<button txButton icon="download" label="Download CSV" (click)="download()"></button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileDownloadExample {
  private readonly rows = [
    ['City', 'Orders'],
    ['Kyiv', '1280'],
    ['Lviv', '640'],
  ];

  download(): void {
    const csv = this.rows.map((row) => row.join(',')).join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv' }), 'orders.csv');
  }
}
