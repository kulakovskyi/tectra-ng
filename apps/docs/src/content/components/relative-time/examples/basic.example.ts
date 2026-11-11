import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxDatePipe } from '@tectra-ng/utils/date';
import { TxRelativeTimePipe } from '@tectra-ng/utils/relative-time';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

@Component({
  selector: 'relative-time-basic-example',
  imports: [TxTable, TxTableCell, TxDatePipe, TxRelativeTimePipe],
  template: `
    <tx-table ariaLabel="Activity" dataKey="id" [value]="events" [columns]="columns">
      <ng-template txTableCell="at" let-value="value">
        <span [title]="value | txDate: 'medium'">{{ value | txRelativeTime }}</span>
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RelativeTimeBasicExample {
  private readonly now = Date.now();
  readonly events = [
    { id: 1, text: 'Deploy finished', at: new Date(this.now - 20_000) },
    { id: 2, text: 'Comment added', at: new Date(this.now - 7 * MINUTE) },
    { id: 3, text: 'Report scheduled', at: new Date(this.now + 3 * HOUR) },
    { id: 4, text: 'Invoice paid', at: new Date(this.now - 2 * DAY) },
    { id: 5, text: 'Trial ends', at: new Date(this.now + 12 * DAY) },
    { id: 6, text: 'Account created', at: new Date(this.now - 400 * DAY) },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'text', header: 'Event' },
    { field: 'at', header: 'When' },
  ];
}
