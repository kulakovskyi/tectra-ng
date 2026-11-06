import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMonthCalendar, TxMonthCalendarEvent } from '@tectra-ng/ui/month-calendar';

@Component({
  selector: 'month-calendar-pass-through-example',
  imports: [TxMonthCalendar],
  template: `<tx-month-calendar [month]="month" [today]="month" [events]="events" [pt]="pt" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarPassThroughExample {
  readonly month = new Date(2026, 9, 1);
  readonly events: TxMonthCalendarEvent[] = [
    { id: '1', start: '2026-10-12', end: '2026-10-14', title: 'Uppercase bar', tone: 'info' },
  ];
  readonly pt = {
    weekday: { style: { textTransform: 'uppercase', letterSpacing: '0.06em' } },
    event: { style: { textTransform: 'uppercase', letterSpacing: '0.04em' } },
  };
}
