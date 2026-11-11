import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxCapitalizePipe, TxHttpPrefixPipe, TxTruncatePipe } from '@tectra-ng/utils/text';

@Component({
  selector: 'text-pipes-example',
  imports: [TxTable, TxTableCell, TxCapitalizePipe, TxHttpPrefixPipe, TxTruncatePipe],
  template: `
    <tx-table ariaLabel="Pipes" dataKey="call" [value]="rows" [columns]="columns">
      <ng-template txTableCell="call" let-value="value"
        ><code>{{ value }}</code></ng-template
      >
      <ng-template txTableCell="result" let-row>
        @switch (row.call) {
          @case ('txTruncate: 20') {
            {{ title | txTruncate: 20 }}
          }
          @case ("txTruncate: 24 : '…' : 'middle'") {
            {{ link | txTruncate: 24 : '…' : 'middle' }}
          }
          @case ('txCapitalize') {
            {{ status | txCapitalize }}
          }
          @default {
            {{ domain | txHttpPrefix }}
          }
        }
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextPipesExample {
  readonly title = 'Quarterly report for the board of directors';
  readonly link = 'https://files.example.com/shared/2026/q3/report-final-v2.pdf';
  readonly status = 'in review';
  readonly domain = 'example.com/pricing';
  readonly rows = [
    { call: 'txTruncate: 20' },
    { call: "txTruncate: 24 : '…' : 'middle'" },
    { call: 'txCapitalize' },
    { call: 'txHttpPrefix' },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'call', header: 'Pipe' },
    { field: 'result', header: 'Result' },
  ];
}
