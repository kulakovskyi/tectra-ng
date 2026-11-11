import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxRelativeTimeOptions, TxRelativeTimePipe } from '@tectra-ng/utils/relative-time';

const DAY = 24 * 60 * 60_000;

@Component({
  selector: 'relative-time-options-example',
  imports: [TxTable, TxTableCell, TxRelativeTimePipe],
  template: `
    <tx-table ariaLabel="Options" dataKey="name" [value]="rows" [columns]="columns">
      <ng-template txTableCell="name" let-value="value"
        ><code>{{ value }}</code></ng-template
      >
      <ng-template txTableCell="hours" let-row>{{
        hoursAgo | txRelativeTime: row.options
      }}</ng-template>
      <ng-template txTableCell="yesterday" let-row>{{
        yesterday | txRelativeTime: row.options
      }}</ng-template>
      <ng-template txTableCell="weeks" let-row>{{
        weeksAgo | txRelativeTime: row.options
      }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RelativeTimeOptionsExample {
  readonly hoursAgo = new Date(Date.now() - 2 * 60 * 60_000);
  readonly yesterday = new Date(Date.now() - DAY);
  readonly weeksAgo = new Date(Date.now() - 45 * DAY);
  readonly rows: { name: string; options: TxRelativeTimeOptions }[] = [
    { name: 'default', options: {} },
    { name: "granularity: 'day'", options: { granularity: 'day' } },
    { name: "largestUnit: 'day'", options: { largestUnit: 'day' } },
    { name: "numeric: 'always'", options: { numeric: 'always' } },
    { name: "style: 'short'", options: { style: 'short', numeric: 'always' } },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Options' },
    { field: 'hours', header: '2 hours ago' },
    { field: 'yesterday', header: 'Yesterday' },
    { field: 'weeks', header: '45 days ago' },
  ];
}
