import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMonthCalendar, TxMonthCalendarEvent } from '@tectra-ng/ui/month-calendar';

@Component({
  selector: 'month-calendar-design-tokens-example',
  imports: [TxMonthCalendar],
  template: `
    <tx-month-calendar
      [month]="month"
      [today]="month"
      [events]="events"
      [dt]="{
        root: { borderRadius: '16px' },
        week: { headHeight: '36px', laneHeight: '26px' },
        event: { height: '22px', borderRadius: '11px', fontSize: '12px' },
        number: { todayBackground: 'var(--tx-success-base)' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarDesignTokensExample {
  readonly month = new Date(2026, 9, 7);
  readonly events: TxMonthCalendarEvent[] = [
    { id: '1', start: '2026-10-05', end: '2026-10-09', title: 'Taller pill bars', tone: 'primary' },
    { id: '2', start: '2026-10-07', title: 'Review', tone: 'success' },
  ];
}
