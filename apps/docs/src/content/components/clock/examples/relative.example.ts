import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxClock } from '@tectra-ng/utils/clock';
import { TxRelativeTimePipe } from '@tectra-ng/utils/relative-time';

@Component({
  selector: 'clock-relative-example',
  imports: [TxTable, TxTableCell, TxRelativeTimePipe],
  template: `
    <tx-table ariaLabel="Comments" dataKey="id" [value]="comments" [columns]="columns">
      <ng-template txTableCell="at" let-value="value">{{
        value | txRelativeTime: { now: clock.now(), numeric: 'always' }
      }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClockRelativeExample {
  readonly clock = inject(TxClock);
  readonly comments = [
    { id: 1, author: 'Ann', at: Date.now() - 12_000 },
    { id: 2, author: 'Mark', at: Date.now() - 95_000 },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'author', header: 'Author' },
    { field: 'at', header: 'Posted' },
  ];
}
