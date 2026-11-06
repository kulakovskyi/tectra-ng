import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxMonthCalendar } from './month-calendar.component';
import { buildMonthLayout, dayIndex, indexToDate, monthWeekdays } from './month-calendar.layout';
import { TxMonthCalendarEventTemplate } from './month-calendar.templates';
import { TxMonthCalendarEvent, TxMonthCalendarMarker } from './month-calendar.types';

const EVENTS: TxMonthCalendarEvent[] = [
  { id: 'a', start: '2026-10-05', end: '2026-10-07', title: 'Sprint', tone: 'primary', avatar: { name: 'Ada Lovelace' } },
  { id: 'b', start: '2026-10-06', title: 'Review', tone: 'success' },
  { id: 'c', start: '2026-10-06', title: 'Retro', tone: 'warn' },
  { id: 'd', start: '2026-10-06', title: 'Demo', tone: 'danger' },
  { id: 'e', start: '2026-10-10', end: '2026-10-13', title: 'Trip', tone: 'neutral' },
];
const MARKERS: TxMonthCalendarMarker[] = [{ date: '2026-10-20', tone: 'warn', label: 'Deadline' }];

@Component({
  imports: [TxMonthCalendar, TxMonthCalendarEventTemplate],
  template: `
    <tx-month-calendar
      [month]="month()"
      [events]="events"
      [markers]="markers"
      [selectedDate]="selected()"
      [weekStartsOn]="1"
      [maxLanes]="2"
      [today]="today"
      locale="en-US"
      [labels]="{ more: '+{count} more' }"
      [dt]="{ root: { borderRadius: '20px' } }"
      [pt]="{ event: { class: 'own-event' } }"
      (dayClick)="days.push($event)"
      (eventClick)="clicked.push($event.id)"
    >
      @if (custom()) {
        <ng-template txMonthCalendarEvent let-event let-segment="segment"><i class="own">{{ event.title }}:{{ segment.span }}</i></ng-template>
      }
    </tx-month-calendar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly month = signal(new Date(2026, 9, 1));
  readonly selected = signal<string | null>('2026-10-14');
  readonly custom = signal(false);
  readonly events = EVENTS;
  readonly markers = MARKERS;
  readonly today = new Date(2026, 9, 15);
  days: Date[] = [];
  clicked: string[] = [];
}

describe('month calendar layout', () => {
  it('turns dates into day indexes and back', () => {
    const index = dayIndex('2026-10-05') as number;
    expect(indexToDate(index)).toEqual(new Date(2026, 9, 5));
    expect(dayIndex(new Date(2026, 9, 5, 23, 59))).toBe(index);
    expect(dayIndex('')).toBeNull();
    expect(dayIndex('nope')).toBeNull();
  });

  it('places events in lanes, splits them by week and counts the overflow', () => {
    const weeks = buildMonthLayout({ month: new Date(2026, 9, 1), events: EVENTS, markers: MARKERS, selectedDate: null, today: new Date(2026, 9, 15), weekStartsOn: 1, maxLanes: 2 });
    expect(weeks).toHaveLength(5);
    expect(weeks[0].days[0].key).toBe('2026-09-28');
    expect(weeks[0].days[0].inMonth).toBe(false);
    const second = weeks[1];
    expect(second.segments.map((segment) => [segment.event.id, segment.lane, segment.column, segment.span])).toEqual([
      ['a', 0, 1, 3],
      ['b', 1, 2, 1],
      ['e', 0, 6, 2],
    ]);
    expect(second.days[1].hidden).toBe(2);
    expect(second.days[1].dots).toEqual(['primary', 'success', 'warn']);
    const third = weeks[2];
    expect(third.segments[0]).toMatchObject({ column: 1, span: 2, startsHere: false, endsHere: true });
    expect(second.segments.find((segment) => segment.event.id === 'e')).toMatchObject({ startsHere: true, endsHere: false });
    expect(weeks[3].days.find((day) => day.key === '2026-10-20')?.markers[0].label).toBe('Deadline');
    expect(weeks[2].days.find((day) => day.today)?.key).toBe('2026-10-15');
  });

  it('names weekdays from the week start', () => {
    expect(monthWeekdays(1, 'en-US').map((day) => day.short)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(monthWeekdays(-1, 'en-US')[0].key).toBe(6);
    expect(monthWeekdays(0, 'en-US').filter((day) => day.weekend).map((day) => day.key)).toEqual([0, 6]);
  });
});

describe('TxMonthCalendar', () => {
  let fixture: ComponentFixture<Host>;
  const root = () => fixture.nativeElement as HTMLElement;
  const day = (key: string) => root().querySelector(`[data-day-key="${key}"]`) as HTMLButtonElement;
  const name = (key: string) => day(key).querySelector('.tx-month-calendar__label')?.textContent?.trim();

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders a labelled grid with weekdays, bars, markers and overflow', () => {
    expect(root().querySelector('[role="grid"]')?.getAttribute('aria-label')).toBe('Calendar');
    expect(root().querySelectorAll('[role="columnheader"]')).toHaveLength(7);
    expect(root().querySelectorAll('[role="gridcell"]')).toHaveLength(35);
    const bars = root().querySelectorAll<HTMLElement>('.tx-month-calendar__event');
    expect(bars[0].style.gridColumn).toBe('1 / span 3');
    expect(bars[0].getAttribute('data-tone')).toBe('primary');
    expect(bars[0].classList).toContain('own-event');
    expect(bars[0].querySelector('tx-avatar')).not.toBeNull();
    expect(root().querySelector('.tx-month-calendar__more')?.textContent?.trim()).toBe('+2 more');
    expect(bars[0].getAttribute('aria-hidden')).toBe('true');
    expect(root().querySelector('.tx-month-calendar__more')?.getAttribute('aria-hidden')).toBe('true');
    expect(root().querySelector('tx-pill')?.textContent?.trim()).toBe('Deadline');
    expect(root().querySelector('tx-month-calendar')?.getAttribute('style') ?? (root().firstElementChild as HTMLElement).style.getPropertyValue('--tx-month-calendar-border-radius')).toContain('20px');
  });

  it('labels days with today, markers and events and marks the selection', () => {
    expect(name('2026-10-15')).toBe('Thursday, October 15, 2026, Today');
    expect(day('2026-10-15').getAttribute('aria-current')).toBe('date');
    expect(name('2026-10-20')).toBe('Tuesday, October 20, 2026, Deadline');
    expect(name('2026-10-06')).toBe('Tuesday, October 6, 2026, 4 events, Sprint, Review, Retro, Demo');
    expect(day('2026-10-14').closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe('true');
    expect(day('2026-10-14').getAttribute('tabindex')).toBe('0');
    expect(day('2026-10-15').getAttribute('tabindex')).toBe('-1');
  });

  it('moves focus with arrows and emits day and event clicks', async () => {
    day('2026-10-14').focus();
    day('2026-10-14').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(day('2026-10-21'));
    expect(day('2026-10-21').getAttribute('tabindex')).toBe('0');
    day('2026-10-21').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(day('2026-10-20'));
    day('2026-10-20').click();
    (root().querySelector('.tx-month-calendar__event') as HTMLButtonElement).click();
    (root().querySelector('.tx-month-calendar__more') as HTMLButtonElement).click();
    expect(fixture.componentInstance.days.map((date) => date.getDate())).toEqual([20, 6]);
    expect(fixture.componentInstance.clicked).toEqual(['a']);
  });

  it('uses an own event template with the segment', async () => {
    fixture.componentInstance.custom.set(true);
    await fixture.whenStable();
    expect(root().querySelector('.own')?.textContent).toBe('Sprint:3');
  });

  it('follows the month input', async () => {
    fixture.componentInstance.month.set(new Date(2026, 1, 1));
    await fixture.whenStable();
    expect(root().querySelectorAll('.tx-month-calendar__week')).toHaveLength(5);
    expect(root().querySelectorAll('.tx-month-calendar__event')).toHaveLength(0);
  });
});
