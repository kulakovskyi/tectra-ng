import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxRelativeTimePipe, relativeTime } from './relative-time';

const NOW = new Date(2026, 10, 11, 12, 0, 0);
const at = (ms: number) => new Date(NOW.getTime() + ms);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

@Component({
  imports: [TxRelativeTimePipe],
  template: `<span class="fixed">{{ value() | txRelativeTime: { now } }}</span><span class="live">{{ value() | txRelativeTime }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RelativeHost {
  readonly now = NOW;
  readonly value = signal<Date | string | null>(at(-5 * MINUTE));
}

describe('relativeTime', () => {
  const options = { now: NOW };

  it('speaks in seconds, minutes and hours within a day', () => {
    expect(relativeTime(at(-20_000), options)).toBe('now');
    expect(relativeTime(at(-5 * MINUTE), options)).toBe('5 minutes ago');
    expect(relativeTime(at(3 * HOUR), options)).toBe('in 3 hours');
  });

  it('switches to calendar days across midnight', () => {
    expect(relativeTime(new Date(2026, 10, 10, 23, 0), options)).toBe('yesterday');
    expect(relativeTime(at(3 * DAY), options)).toBe('in 3 days');
    expect(relativeTime(at(-45 * DAY), options)).toBe('last month');
    expect(relativeTime(at(-400 * DAY), options)).toBe('last year');
  });

  it('honours granularity, the largest unit and the locale', () => {
    expect(relativeTime(at(-2 * HOUR), { ...options, granularity: 'day' })).toBe('today');
    expect(relativeTime(at(-45 * DAY), { ...options, largestUnit: 'day' })).toBe('45 days ago');
    expect(relativeTime(at(-400 * DAY), { ...options, largestUnit: 'month' })).toBe('13 months ago');
    expect(relativeTime(at(-DAY), { ...options, locale: 'uk-UA' })).toBe('учора');
    expect(relativeTime(at(-DAY), { ...options, numeric: 'always' })).toBe('1 day ago');
    expect(relativeTime(at(-20_000), { ...options, numeric: 'always' })).toBe('20 seconds ago');
    expect(relativeTime(null)).toBe('');
    expect(relativeTime(new Date(Date.now() + 3 * DAY))).toBe('in 3 days');
    expect(relativeTime('broken')).toBe('');
  });

  it('follows the tectra locale in templates', async () => {
    const fixture = TestBed.createComponent(RelativeHost);
    fixture.detectChanges();
    const text = (selector: string) => (fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent;
    expect(text('.fixed')).toBe('5 minutes ago');
    fixture.detectChanges();
    expect(text('.fixed')).toBe('5 minutes ago');
    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.detectChanges();
    expect(text('.fixed')).toBe('5 хвилин тому');
  });
  it('reuses the last text while nothing changes', () => {
    const pipe = TestBed.runInInjectionContext(() => new TxRelativeTimePipe());
    const value = at(-5 * MINUTE);
    expect(pipe.transform(value, { now: NOW })).toBe('5 minutes ago');
    expect(pipe.transform(value, { now: NOW })).toBe('5 minutes ago');
  });

  it('measures from the current time when no now is given', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const fixture = TestBed.createComponent(RelativeHost);
    fixture.componentInstance.value.set('2026-11-11T11:00:00');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.live')?.textContent).toBe('1 hour ago');
    vi.useRealTimers();
  });
});
