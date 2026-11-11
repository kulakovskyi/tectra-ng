import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxDatePipe, provideTxDateFormat } from '@tectra-ng/utils/date';

@Component({
  selector: 'date-defaults-example',
  imports: [TxTable, TxTableCell, TxDatePipe],
  providers: [provideTxDateFormat({ format: 'd MMM yyyy', empty: 'Not set' })],
  template: `
    <tx-table ariaLabel="Contracts" dataKey="id" [value]="contracts" [columns]="columns">
      <ng-template txTableCell="signed" let-value="value">{{ value | txDate }}</ng-template>
      <ng-template txTableCell="ends" let-value="value">{{ value | txDate }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DateDefaultsExample {
  readonly contracts = [
    { id: 1, name: 'Hosting', signed: '2025-03-01', ends: '2027-02-28' },
    { id: 2, name: 'Support', signed: '2026-06-15', ends: null },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Contract' },
    { field: 'signed', header: 'Signed' },
    { field: 'ends', header: 'Ends' },
  ];
}
