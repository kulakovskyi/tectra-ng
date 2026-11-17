import { ChangeDetectionStrategy, Component, contentChild, input } from '@angular/core';
import { TxCard } from '@tectra-ng/ui/card';
import {
  TxMonthCalendar,
  TxMonthCalendarEvent,
  TxMonthCalendarEventTemplate,
} from '@tectra-ng/ui/month-calendar';

@Component({
  selector: 'shift-calendar',
  imports: [TxCard, TxMonthCalendar],
  template: `
    <tx-card [title]="title()">
      <tx-month-calendar
        [month]="month()"
        [today]="month()"
        [events]="events()"
        [eventTemplate]="event()?.templateRef"
      />
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShiftCalendar {
  readonly title = input('');
  readonly month = input(new Date());
  readonly events = input<TxMonthCalendarEvent[]>([]);
  readonly event = contentChild(TxMonthCalendarEventTemplate);
}

@Component({
  selector: 'month-calendar-template-input-example',
  imports: [ShiftCalendar, TxMonthCalendarEventTemplate],
  template: `
    <shift-calendar title="Support shifts" [month]="month" [events]="events">
      <ng-template txMonthCalendarEvent let-event let-segment="segment">
        <strong>{{ event.title }}</strong>
        @if (segment.span > 2) {
          <span class="hours">{{ segment.span * 8 }} h</span>
        }
      </ng-template>
    </shift-calendar>
  `,
  styles: `
    .hours {
      margin-inline-start: auto;
      white-space: nowrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarTemplateInputExample {
  readonly month = new Date(2026, 6, 1);
  readonly events: TxMonthCalendarEvent[] = [
    { id: '1', start: '2026-07-06', end: '2026-07-10', title: 'Early shift', tone: 'info' },
    { id: '2', start: '2026-07-13', end: '2026-07-14', title: 'Late shift', tone: 'warn' },
    { id: '3', start: '2026-07-20', end: '2026-07-24', title: 'On call', tone: 'danger' },
  ];
}
