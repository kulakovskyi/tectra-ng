import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableColumn } from '@tectra/ui/table';

interface Log {
  id: number;
  time: string;
  event: string;
}

const EVENTS = [
  'Signed in',
  'Exported a report',
  'Changed a password',
  'Invited a member',
  'Archived a project',
];
const LOGS: Log[] = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  time: `09:${String(index * 2).padStart(2, '0')}`,
  event: EVENTS[index % EVENTS.length],
}));

@Component({
  selector: 'table-scroll-height-example',
  imports: [TxTable],
  template: `<tx-table
    ariaLabel="Activity"
    dataKey="id"
    scrollHeight="280px"
    [value]="logs"
    [columns]="columns"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableScrollHeightExample {
  readonly logs = LOGS;
  readonly columns: TxTableColumn[] = [
    { field: 'time', header: 'Time', initialWidth: '100px' },
    { field: 'event', header: 'Event', initialWidth: '300px' },
  ];
}
