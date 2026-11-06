import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import {
  TxMonthCalendar,
  TxMonthCalendarEvent,
  TxMonthCalendarEventTemplate,
} from '@tectra-ng/ui/month-calendar';

interface Booking {
  room: string;
  guests: number;
}

@Component({
  selector: 'month-calendar-event-template-example',
  imports: [TxMonthCalendar, TxMonthCalendarEventTemplate, TxIcon],
  template: `
    <tx-month-calendar [month]="month" [today]="month" [events]="events">
      <ng-template txMonthCalendarEvent let-event let-segment="segment">
        @if (segment.startsHere) {
          <tx-icon name="home" />
        }
        <span class="label">{{ event.title }}</span>
        @if (segment.span > 1) {
          <span class="guests">{{ guests(event) }} guests</span>
        }
      </ng-template>
    </tx-month-calendar>
  `,
  styles: `
    .label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .guests {
      margin-inline-start: auto;
      white-space: nowrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarEventTemplateExample {
  readonly month = new Date(2026, 6, 1);
  readonly events: TxMonthCalendarEvent<Booking>[] = [
    {
      id: '1',
      start: '2026-07-03',
      end: '2026-07-08',
      title: 'Sea view suite',
      tone: 'primary',
      data: { room: 'A1', guests: 2 },
    },
    {
      id: '2',
      start: '2026-07-10',
      end: '2026-07-11',
      title: 'Garden room',
      tone: 'success',
      data: { room: 'B4', guests: 3 },
    },
    {
      id: '3',
      start: '2026-07-14',
      end: '2026-07-24',
      title: 'Family loft',
      tone: 'warn',
      data: { room: 'C2', guests: 5 },
    },
  ];

  guests(event: TxMonthCalendarEvent): number {
    return (event.data as Booking | undefined)?.guests ?? 0;
  }
}
