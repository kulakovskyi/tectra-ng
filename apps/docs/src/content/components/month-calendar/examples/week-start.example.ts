import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMonthCalendar, TxMonthCalendarEvent } from '@tectra-ng/ui/month-calendar';

@Component({
  selector: 'month-calendar-week-start-example',
  imports: [TxMonthCalendar],
  template: `
    <tx-month-calendar
      locale="uk-UA"
      [weekStartsOn]="1"
      [month]="month"
      [today]="month"
      [events]="events"
      [labels]="{ today: 'Сьогодні', region: 'Календар відпусток', more: 'ще {count}' }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarWeekStartExample {
  readonly month = new Date(2026, 4, 1);
  readonly events: TxMonthCalendarEvent[] = [
    {
      id: '1',
      start: '2026-05-04',
      end: '2026-05-15',
      title: 'Відпустка — Тарас',
      tone: 'success',
    },
    { id: '2', start: '2026-05-11', end: '2026-05-22', title: 'Відпустка — Ірина', tone: 'info' },
  ];
}
