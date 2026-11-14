import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { provideTxDateFormat } from './date.config';
import { MS_IN_DAY, TX_DATE_FORMATS, TX_DATE_STYLES } from './date.constants';
import {
  addDays,
  addMonths,
  addYears,
  calendarDaysBetween,
  endOfDay,
  isExpiringWithin,
  isSameDay,
  isValidDate,
  middleOfDay,
  startOfDay,
  startOfWeek,
  toDate,
  toIsoDay,
  toIsoRange,
  toIsoString,
} from './date.functions';
import { TxDatePipe, TxDateRangePipe } from './date.pipe';
import { TxDateFormat, TxDateInput } from './date.types';

@Component({
  imports: [TxDatePipe, TxDateRangePipe],
  template: `<span class="value">{{ value() | txDate: format() }}</span><span class="range">{{ (range() | txDateRange)?.start }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DateHost {
  readonly value = signal<TxDateInput>(new Date(2026, 10, 11, 9, 5));
  readonly format = signal<TxDateFormat | undefined>(TX_DATE_FORMATS.dateTime);
  readonly range = signal<TxDateInput[]>([new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 0, 31))]);
}

function render(providers: unknown[] = []) {
  TestBed.configureTestingModule({ providers: providers as never[] });
  const fixture = TestBed.createComponent(DateHost);
  fixture.detectChanges();
  const text = (selector: string) => (fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent;
  return { fixture, text };
}

describe('txDate pipe', () => {
  it('formats with Angular patterns', () => {
    const { text } = render();
    expect(text('.value')).toBe('11.11.26 09:05');
  });

  it('uses a medium date in the tectra locale by default and follows a locale switch', async () => {
    const { fixture, text } = render();
    fixture.componentInstance.format.set(undefined);
    fixture.detectChanges();
    expect(text('.value')).toBe('Nov 11, 2026');
    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.detectChanges();
    expect(text('.value')).toBe(new Intl.DateTimeFormat('uk-UA', { dateStyle: 'medium' }).format(new Date(2026, 10, 11)));
    fixture.componentInstance.format.set('d MMMM');
    fixture.detectChanges();
    expect(text('.value')).toBe('11 November');
    fixture.componentInstance.format.set(TX_DATE_FORMATS.dateTime);
    fixture.detectChanges();
    expect(text('.value')).toBe('11.11.26 09:05');
  });

  it('formats with Intl styles and options', () => {
    const { fixture, text } = render();
    fixture.componentInstance.format.set(TX_DATE_STYLES.dateTime);
    fixture.detectChanges();
    expect(text('.value')).toBe(new Intl.DateTimeFormat('en-US', TX_DATE_STYLES.dateTime).format(new Date(2026, 10, 11, 9, 5)));
    fixture.componentInstance.format.set({ month: 'long', day: 'numeric' });
    fixture.detectChanges();
    expect(text('.value')).toBe('November 11');
    fixture.detectChanges();
    expect(text('.value')).toBe('November 11');
  });

  it('formats Intl styles in an offset, UTC or a named time zone', () => {
    const pipe = TestBed.runInInjectionContext(() => new TxDatePipe());
    const time = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } as const;
    expect(pipe.transform('2026-11-11T22:30:00Z', time, '+0200')).toBe('00:30');
    expect(pipe.transform('2026-11-11T22:30:00Z', time, 'GMT-03:30')).toBe('19:00');
    expect(pipe.transform('2026-11-11T22:30:00Z', time, 'UTC')).toBe('22:30');
    expect(pipe.transform('2026-11-11T22:30:00Z', time, 'Asia/Tokyo')).toBe('07:30');
    expect(pipe.transform('2026-11-11T22:30:00Z', time, 'Not/AZone')).toBe('-');
  });

  it('shows the empty text for empty and broken values', () => {
    const { fixture, text } = render();
    for (const value of [null, undefined, '', 'not a date', Number.NaN]) {
      fixture.componentInstance.value.set(value);
      fixture.detectChanges();
      expect(text('.value')).toBe('-');
    }
  });

  it('takes defaults from provideTxDateFormat', () => {
    const { fixture, text } = render([provideTxDateFormat({ format: TX_DATE_FORMATS.isoDay, empty: '—' })]);
    fixture.componentInstance.format.set(undefined);
    fixture.detectChanges();
    expect(text('.value')).toBe('2026-11-11');
    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    expect(text('.value')).toBe('—');
  });

  it('formats in a time zone', () => {
    const pipe = TestBed.runInInjectionContext(() => new TxDatePipe());
    expect(pipe.transform('2026-11-11T22:30:00Z', 'HH:mm', '+0200')).toBe('00:30');
  });

  it('returns ISO bounds of a range', () => {
    const { text } = render();
    expect(text('.range')).toBe('2026-01-01T00:00:00.000Z');
    expect(new TxDateRangePipe().transform([new Date(), null])).toBeNull();
  });
});

describe('date functions', () => {
  const base = new Date(2026, 0, 31, 15, 20);

  it('parses values safely', () => {
    expect(toDate('2026-11-11')?.getUTCDate()).toBe(11);
    expect(toDate('')).toBeNull();
    expect(toDate('nope')).toBeNull();
    expect(isValidDate(0)).toBe(true);
    expect(isValidDate(undefined)).toBe(false);
  });

  it('moves to the start, middle and end of a day without touching the input', () => {
    expect(startOfDay(base).getHours()).toBe(0);
    expect(middleOfDay(base).getHours()).toBe(12);
    expect(endOfDay(base).getMilliseconds()).toBe(999);
    expect(base.getHours()).toBe(15);
  });

  it('adds calendar days, months and years', () => {
    expect(toIsoDay(addDays(base, 1))).toBe('2026-02-01');
    expect(toIsoDay(addDays(base, -31))).toBe('2025-12-31');
    expect(toIsoDay(addMonths(base, 1))).toBe('2026-02-28');
    expect(toIsoDay(addYears(new Date(2024, 1, 29), 1))).toBe('2025-02-28');
  });

  it('finds the start of a week for any first day', () => {
    expect(toIsoDay(startOfWeek(new Date(2026, 10, 11)))).toBe('2026-11-09');
    expect(toIsoDay(startOfWeek(new Date(2026, 10, 11), 0))).toBe('2026-11-08');
    expect(toIsoDay(startOfWeek(new Date(2026, 10, 8)))).toBe('2026-11-02');
  });

  it('counts calendar days and compares days', () => {
    expect(calendarDaysBetween(new Date(2026, 2, 28, 23), new Date(2026, 2, 30, 1))).toBe(2);
    expect(calendarDaysBetween('2026-11-11', '2026-11-01')).toBe(-10);
    expect(isSameDay(new Date(2026, 1, 1, 1), new Date(2026, 1, 1, 23))).toBe(true);
    expect(isSameDay(null, new Date())).toBe(false);
  });

  it('writes ISO strings', () => {
    expect(toIsoString(new Date(Date.UTC(2026, 0, 1)))).toBe('2026-01-01T00:00:00.000Z');
    expect(toIsoString('2026-01-01')).toBe('2026-01-01');
    expect(toIsoString(null)).toBeUndefined();
    expect(toIsoRange(['2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z'])).toEqual({ start: '2026-01-01T00:00:00.000Z', end: '2026-01-02T00:00:00.000Z' });
    expect(toIsoRange([new Date()])).toBeNull();
  });

  it('tells whether a date expires within a period', () => {
    const now = Date.UTC(2026, 0, 1);
    expect(isExpiringWithin(now + 3 * MS_IN_DAY, undefined, now)).toBe(true);
    expect(isExpiringWithin(now + 8 * MS_IN_DAY, undefined, now)).toBe(false);
    expect(isExpiringWithin(now + 8 * MS_IN_DAY, 10 * MS_IN_DAY, now)).toBe(true);
    expect(isExpiringWithin(now - MS_IN_DAY, undefined, now)).toBe(true);
    expect(isExpiringWithin(undefined)).toBe(false);
  });
  it('shows the empty text when the format gives nothing or the locale is unknown', () => {
    const pipe = TestBed.runInInjectionContext(() => new TxDatePipe());
    expect(pipe.transform('2026-11-11', '')).toBe('-');
    expect(pipe.transform('2026-11-11', 'yyyy', undefined, 'xx-unknown')).toBe('-');
    expect(toIsoString('')).toBeUndefined();
  });
});
