import { PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxDateInput } from '@tectra-ng/utils/date';
import { TxClock } from './clock';

describe('TxClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 11, 12, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('ticks every second in the browser', () => {
    const clock = TestBed.inject(TxClock);
    const start = clock.now();
    vi.advanceTimersByTime(3000);
    expect(clock.now() - start).toBe(3000);
  });

  it('does not tick on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const clock = TestBed.inject(TxClock);
    const start = clock.now();
    vi.advanceTimersByTime(3000);
    expect(clock.now()).toBe(start);
  });

  it('counts down to a target and flags the end', () => {
    const clock = TestBed.inject(TxClock);
    const target = signal<TxDateInput>(Date.now() + 5000);
    const state = clock.countdown(target, 2000);
    expect(state.remainingMs()).toBe(5000);
    expect(state.isEndingSoon()).toBe(false);
    vi.advanceTimersByTime(3000);
    expect(state.isEndingSoon()).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(state.remainingMs()).toBe(0);
    expect(state.isExpired()).toBe(true);
    target.set(null);
    expect(state.isExpired()).toBe(false);
    expect(clock.countdown('2020-01-01').isExpired()).toBe(true);
  });

  it('tells whether a date is still ahead', () => {
    const clock = TestBed.inject(TxClock);
    expect(clock.isInFuture(Date.now() + 1000)).toBe(true);
    expect(clock.isInFuture('2020-01-01')).toBe(false);
    expect(clock.isInFuture(undefined)).toBe(false);
  });
});
