import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { Observable, defer, throwError } from 'rxjs';
import { buildHttpParams } from './http-params.functions';
import { httpRetryDelay, parseRetryAfter, retryHttpReads } from './http-retry.functions';
import { TxHttpStatusLabelPipe, TxHttpStatusTonePipe, httpStatusGroup, httpStatusTone } from './http-status';

@Component({
  imports: [TxHttpStatusLabelPipe, TxHttpStatusTonePipe],
  template: `<span class="label">{{ status() | txHttpStatusLabel }}</span><span class="tone">{{ status() | txHttpStatusTone: [270] }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StatusHost {
  readonly status = signal<number | null>(404);
}

const httpError = (status: number, headers?: Record<string, string>) => new HttpErrorResponse({ status, headers: new HttpHeaders(headers) });

describe('buildHttpParams', () => {
  it('skips empty values, repeats arrays, writes dates and objects', () => {
    const params = buildHttpParams({
      search: 'kyiv',
      empty: '',
      none: null,
      missing: undefined,
      page: 0,
      active: false,
      ids: [1, '', null, 2],
      tags: [],
      from: new Date(Date.UTC(2026, 0, 1)),
      range: { min: 1 },
    });
    expect(params.toString()).toBe('search=kyiv&page=0&active=false&ids=1&ids=2&from=2026-01-01T00:00:00.000Z&range=%7B%22min%22:1%7D');
  });
});

describe('http retry', () => {
  it('parses Retry-After as seconds or a date', () => {
    expect(parseRetryAfter('3')).toBe(3000);
    expect(parseRetryAfter('Thu, 01 Jan 2026 00:00:10 GMT', Date.UTC(2026, 0, 1))).toBe(10000);
    expect(parseRetryAfter('soon')).toBeNull();
    expect(parseRetryAfter(null)).toBeNull();
  });

  it('backs off exponentially and honours Retry-After up to the cap', () => {
    const base = { baseDelayMs: 1000, maxDelayMs: 5000 };
    expect(httpRetryDelay({ ...base, error: httpError(503), attempt: 1 })).toBe(1000);
    expect(httpRetryDelay({ ...base, error: httpError(503), attempt: 3 })).toBe(4000);
    expect(httpRetryDelay({ ...base, error: httpError(503), attempt: 5 })).toBe(5000);
    expect(httpRetryDelay({ ...base, error: httpError(429, { 'Retry-After': '2' }), attempt: 1 })).toBe(2000);
    expect(httpRetryDelay({ ...base, error: httpError(429, { 'Retry-After': '60' }), attempt: 1 })).toBeNull();
  });

  it('retries retryable statuses and gives up on the rest', () => {
    vi.useFakeTimers();
    const run = (statuses: number[]) => {
      let calls = 0;
      let failed: unknown = null;
      const source: Observable<string> = defer(() => {
        const status = statuses[calls++];
        return status ? throwError(() => httpError(status)) : new Observable<string>((subscriber) => subscriber.next('ok'));
      });
      let value = '';
      source.pipe(retryHttpReads({ baseDelayMs: 100 })).subscribe({ next: (next) => (value = next), error: (error) => (failed = error) });
      vi.advanceTimersByTime(10000);
      return { calls, value, failed };
    };
    expect(run([503, 502])).toMatchObject({ calls: 3, value: 'ok' });
    expect(run([404])).toMatchObject({ calls: 1, value: '' });
    expect(run([503, 503, 503, 503, 503, 503]).failed).toBeInstanceOf(HttpErrorResponse);
    vi.useRealTimers();
  });
});

describe('http status', () => {
  it('groups statuses and maps them to kit tones', () => {
    expect([null, 0, 101, 200, 302, 404, 503, 270].map((status) => httpStatusGroup(status, [270]))).toEqual([
      'noResponse',
      'noResponse',
      'unknown',
      'ok',
      'redirect',
      'clientError',
      'serverError',
      'warning',
    ]);
    expect(httpStatusTone(201)).toBe('success');
    expect(httpStatusTone(301)).toBe('info');
    expect(httpStatusTone(500)).toBe('danger');
    expect(httpStatusTone(270, [270])).toBe('warn');
    expect(httpStatusTone(undefined)).toBe('secondary');
  });

  it('shows translated labels', async () => {
    const fixture = TestBed.createComponent(StatusHost);
    fixture.detectChanges();
    const text = (selector: string) => (fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent;
    expect(text('.label')).toBe('Client error');
    expect(text('.tone')).toBe('danger');
    fixture.componentInstance.status.set(270);
    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.detectChanges();
    expect(text('.label')).toBe('OK');
    expect(text('.tone')).toBe('warn');
    fixture.componentInstance.status.set(null);
    fixture.detectChanges();
    expect(text('.label')).toBe('Немає відповіді');
  });
});
