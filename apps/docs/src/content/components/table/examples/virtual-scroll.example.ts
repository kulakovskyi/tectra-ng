import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableColumn } from '@tectra/ui/table';

interface LogEvent {
  id: number;
  time: string;
  message: string;
}

const MESSAGES = [
  'Request served',
  'Cache refreshed',
  'Job queued',
  'Job finished',
  'User signed in',
];
const EVENTS: LogEvent[] = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  time: `${String(Math.floor(index / 60) % 24).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}`,
  message: MESSAGES[index % MESSAGES.length],
}));

@Component({
  selector: 'table-virtual-scroll-example',
  imports: [TxTable],
  template: `<tx-table
    ariaLabel="Events"
    dataKey="id"
    scrollHeight="360px"
    selectionMode="single"
    virtualScroll
    [value]="events"
    [columns]="columns"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableVirtualScrollExample {
  readonly events = EVENTS;
  readonly columns: TxTableColumn[] = [
    { field: 'id', header: '#', initialWidth: '90px' },
    { field: 'time', header: 'Time', initialWidth: '90px' },
    { field: 'message', header: 'Message', initialWidth: '260px' },
  ];
}
