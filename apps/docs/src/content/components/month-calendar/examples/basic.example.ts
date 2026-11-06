import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxMonthCalendar,
  TxMonthCalendarEvent,
  TxMonthCalendarMarker,
} from '@tectra-ng/ui/month-calendar';

@Component({
  selector: 'month-calendar-basic-example',
  imports: [TxMonthCalendar],
  template: `<tx-month-calendar
    [month]="month"
    [today]="today"
    [events]="events"
    [markers]="markers"
    [weekStartsOn]="1"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarBasicExample {
  readonly month = new Date(2026, 9, 1);
  readonly today = new Date(2026, 9, 15);
  readonly events: TxMonthCalendarEvent[] = [
    {
      id: '1',
      start: '2026-10-05',
      end: '2026-10-09',
      title: 'Sprint 42',
      tone: 'primary',
      avatar: { name: 'Ada Lovelace' },
    },
    { id: '2', start: '2026-10-07', title: 'Design review', tone: 'info' },
    {
      id: '3',
      start: '2026-10-12',
      end: '2026-10-16',
      title: 'Conference trip',
      tone: 'warn',
      avatar: { name: 'Оксана Коваль' },
    },
    { id: '4', start: '2026-10-15', title: 'Release 2.4', tone: 'success' },
    {
      id: '5',
      start: '2026-10-22',
      end: '2026-10-27',
      title: 'Vacation',
      tone: 'neutral',
      avatar: { name: 'Alan Turing' },
    },
    { id: '6', start: '2026-10-29', title: 'Incident review', tone: 'danger' },
  ];
  readonly markers: TxMonthCalendarMarker[] = [
    { date: '2026-10-20', tone: 'danger', label: 'Deadline', icon: 'flag' },
    { date: '2026-10-31', tone: 'success', label: 'Payday' },
  ];
}
