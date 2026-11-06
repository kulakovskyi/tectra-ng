import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxMonthCalendar, TxMonthCalendarEvent } from '@tectra-ng/ui/month-calendar';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'month-calendar-lanes-example',
  imports: [FormsModule, TxMonthCalendar, TxSelect],
  template: `
    <div class="bar">
      <tx-select
        ariaLabel="Bar rows"
        [options]="options"
        [ngModel]="lanes()"
        (ngModelChange)="lanes.set($event)"
      />
    </div>
    <tx-month-calendar
      [month]="month"
      [today]="month"
      [events]="events"
      [maxLanes]="lanes()"
      [labels]="{ more: '+{count} more' }"
    />
  `,
  styles: `
    .bar {
      margin-bottom: 12px;
      max-width: 200px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarLanesExample {
  readonly month = new Date(2026, 9, 1);
  readonly lanes = signal(2);
  readonly options = [1, 2, 3, 4].map((value) => ({
    label: `${value} row${value > 1 ? 's' : ''} per week`,
    value,
  }));
  readonly events: TxMonthCalendarEvent[] = [
    { id: '1', start: '2026-10-12', end: '2026-10-16', title: 'Design sprint', tone: 'primary' },
    { id: '2', start: '2026-10-13', title: 'Interview', tone: 'info' },
    { id: '3', start: '2026-10-13', end: '2026-10-14', title: 'Workshop', tone: 'success' },
    { id: '4', start: '2026-10-13', title: 'Dentist', tone: 'neutral' },
    { id: '5', start: '2026-10-14', title: 'Budget review', tone: 'warn' },
  ];
}
