import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxNumberPipe } from '@tectra-ng/utils/number';

@Component({
  selector: 'number-basic-example',
  imports: [TxTable, TxTableCell, TxNumberPipe],
  template: `
    <tx-table ariaLabel="Traffic" dataKey="id" [value]="pages" [columns]="columns">
      <ng-template txTableCell="visits" let-value="value">{{
        value | txNumber: { notation: 'compact' }
      }}</ng-template>
      <ng-template txTableCell="time" let-value="value">{{
        value | txNumber: { style: 'unit', unit: 'second', maximumFractionDigits: 1 }
      }}</ng-template>
      <ng-template txTableCell="conversion" let-value="value">{{
        value | txNumber: { style: 'percent', maximumFractionDigits: 1 }
      }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NumberBasicExample {
  readonly pages = [
    { id: 1, page: 'Pricing', visits: 48210, time: 74.25, conversion: 0.0412 },
    { id: 2, page: 'Docs', visits: 1290340, time: 192.5, conversion: 0.0087 },
    { id: 3, page: 'Blog', visits: 9120, time: null, conversion: null },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'page', header: 'Page' },
    { field: 'visits', header: 'Visits' },
    { field: 'time', header: 'Time on page' },
    { field: 'conversion', header: 'Conversion' },
  ];
}
