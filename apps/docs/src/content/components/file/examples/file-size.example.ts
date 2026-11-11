import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxFileSizePipe } from '@tectra-ng/utils/file';

@Component({
  selector: 'file-file-size-example',
  imports: [TxTable, TxTableCell, TxFileSizePipe],
  template: `
    <tx-table ariaLabel="Files" dataKey="name" [value]="files" [columns]="columns">
      <ng-template txTableCell="size" let-value="value">{{ value | txFileSize }}</ng-template>
      <ng-template txTableCell="decimal" let-row>{{
        row.size | txFileSize: { base: 1000, decimals: 2 }
      }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileFileSizeExample {
  readonly files = [
    { name: 'notes.txt', size: 812 },
    { name: 'logo.svg', size: 14_336 },
    { name: 'report.pdf', size: 2_621_440 },
    { name: 'backup.zip', size: 4_831_838_208 },
    { name: 'upload.tmp', size: null },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'File' },
    { field: 'size', header: 'Size', align: 'end' },
    { field: 'decimal', header: 'Base 1000', align: 'end' },
  ];
}
