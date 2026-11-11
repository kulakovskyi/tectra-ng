import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxDatePipe } from '@tectra-ng/utils/date';

@Component({
  selector: 'date-time-zone-example',
  imports: [TxTable, TxTableCell, TxDatePipe],
  template: `
    <tx-table
      ariaLabel="Release time per office"
      dataKey="office"
      [value]="offices"
      [columns]="columns"
    >
      <ng-template txTableCell="time" let-office>{{
        release | txDate: 'EEE, d MMM HH:mm' : office.offset
      }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DateTimeZoneExample {
  readonly release = '2026-11-12T07:30:00Z';
  readonly offices = [
    { office: 'Kyiv', offset: '+0200' },
    { office: 'London', offset: 'UTC' },
    { office: 'New York', offset: '-0500' },
    { office: 'Tokyo', offset: '+0900' },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'office', header: 'Office' },
    { field: 'offset', header: 'Offset' },
    { field: 'time', header: 'Release' },
  ];
}
