import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxMonthCalendar,
  TxMonthCalendarEvent,
  TxMonthCalendarMarker,
} from '@tectra-ng/ui/month-calendar';

@Component({
  selector: 'month-calendar-compact-example',
  imports: [TxMonthCalendar],
  template: `
    <div class="narrow">
      <tx-month-calendar
        [month]="month"
        [today]="today"
        [events]="events"
        [markers]="markers"
        [selectedDate]="'2026-10-21'"
        [weekStartsOn]="1"
      />
    </div>
  `,
  styles: `
    .narrow {
      max-width: 340px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarCompactExample {
  readonly month = new Date(2026, 9, 1);
  readonly today = new Date(2026, 9, 15);
  readonly events: TxMonthCalendarEvent[] = [
    { id: '1', start: '2026-10-05', end: '2026-10-07', title: 'Sprint', tone: 'primary' },
    { id: '2', start: '2026-10-06', title: 'Review', tone: 'success' },
    { id: '3', start: '2026-10-06', title: 'Demo', tone: 'danger' },
    { id: '4', start: '2026-10-21', title: 'Planning', tone: 'info' },
  ];
  readonly markers: TxMonthCalendarMarker[] = [
    { date: '2026-10-28', tone: 'warn', label: 'Deadline' },
  ];
}
