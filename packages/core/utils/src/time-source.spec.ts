import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TX_TIME_STEP_MS, TxTimeSource } from './time-source';

describe('TxTimeSource', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date(2026, 10, 11, 12, 0, 0, 400));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('ticks at the start of every second with one timer for every caller', () => {
    const source = TestBed.inject(TxTimeSource);
    const now = source.every();
    expect(source.every('second')).toBe(now);
    expect(TestBed.inject(TxTimeSource)).toBe(source);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(599);
    expect(now() % 1000).toBe(400);
    vi.advanceTimersByTime(1);
    expect(now() % 1000).toBe(0);
    vi.advanceTimersByTime(2000);
    expect(new Date(now()).getSeconds()).toBe(3);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('ticks at the start of every minute', () => {
    const minute = TestBed.inject(TxTimeSource).every('minute');
    const start = minute();
    vi.advanceTimersByTime(30000);
    expect(minute()).toBe(start);
    vi.advanceTimersByTime(TX_TIME_STEP_MS.minute - 30000);
    expect(new Date(minute()).getMinutes()).toBe(1);
    expect(minute() % TX_TIME_STEP_MS.minute).toBe(0);
  });

  it('stops its timers with the app', () => {
    TestBed.inject(TxTimeSource).every();
    TestBed.inject(TxTimeSource).every('minute');
    expect(vi.getTimerCount()).toBe(2);
    TestBed.resetTestingModule();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('runs no timer on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const now = TestBed.inject(TxTimeSource).every();
    const start = now();
    vi.advanceTimersByTime(5000);
    expect(vi.getTimerCount()).toBe(0);
    expect(now()).toBe(start);
  });
});
