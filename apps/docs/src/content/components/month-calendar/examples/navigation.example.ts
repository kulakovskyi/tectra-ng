import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMonthCalendar, TxMonthCalendarEvent } from '@tectra-ng/ui/month-calendar';

@Component({
  selector: 'month-calendar-navigation-example',
  imports: [TxMonthCalendar, TxButton],
  template: `
    <div class="bar">
      <button
        txButton
        icon="chevron-left"
        severity="secondary"
        variant="text"
        [rounded]="true"
        aria-label="Previous month"
        (click)="shift(-1)"
      ></button>
      <strong class="title">{{ title() }}</strong>
      <button
        txButton
        icon="chevron-right"
        severity="secondary"
        variant="text"
        [rounded]="true"
        aria-label="Next month"
        (click)="shift(1)"
      ></button>
      <button
        txButton
        label="Today"
        severity="secondary"
        variant="outlined"
        size="small"
        (click)="goToday()"
      ></button>
    </div>
    <tx-month-calendar
      [month]="month()"
      [events]="events"
      [selectedDate]="selected()"
      (dayClick)="selected.set($event)"
      (eventClick)="opened.set($event.title)"
    />
    <p class="hint" aria-live="polite">
      {{ selected() ? 'Selected ' + selected()!.toDateString() : 'Click a day'
      }}{{ opened() ? ' · opened “' + opened() + '”' : '' }}
    </p>
  `,
  styles: `
    .bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .title {
      min-width: 140px;
      text-align: center;
    }
    .hint {
      margin: 12px 0 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MonthCalendarNavigationExample {
  readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly selected = signal<Date | null>(null);
  readonly opened = signal('');
  readonly title = computed(() =>
    this.month().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  );
  readonly events: TxMonthCalendarEvent[] = (() => {
    const base = new Date();
    const day = (offset: number) =>
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    return [
      { id: 'a', start: day(-3), end: day(1), title: 'Onboarding week', tone: 'primary' },
      { id: 'b', start: day(2), title: 'Client call', tone: 'info' },
      { id: 'c', start: day(6), end: day(9), title: 'Offsite', tone: 'success' },
      { id: 'd', start: day(-12), end: day(-10), title: 'Audit', tone: 'warn' },
    ];
  })();

  shift(months: number): void {
    this.month.update((month) => new Date(month.getFullYear(), month.getMonth() + months, 1));
  }

  goToday(): void {
    const today = new Date();
    this.month.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selected.set(today);
  }
}
