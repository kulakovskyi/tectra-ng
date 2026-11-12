import { HttpErrorResponse } from '@angular/common/http';
import { Observable, defer, of, throwError } from 'rxjs';
import { poll, pollDelay, refreshEvery, toPollingError } from './poll';
import { TxPoller } from './poller';

interface Job {
  status: 'running' | 'done';
  step: number;
}

function jobServer(steps: number, failAt?: number) {
  let calls = 0;
  const request = (): Observable<Job> =>
    defer(() => {
      calls++;
      if (calls === failAt) {
        return throwError(() => new HttpErrorResponse({ status: 500, error: { error: 'Boom' } }));
      }
      return of<Job>({ status: calls >= steps ? 'done' : 'running', step: calls });
    });
  return { request, calls: () => calls };
}

describe('polling', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('computes fixed and back-off delays', () => {
    expect(pollDelay(1000, 5)).toBe(1000);
    expect(pollDelay({ startMs: 1000, factor: 2, maxMs: 5000 }, 0)).toBe(1000);
    expect(pollDelay({ startMs: 1000, factor: 2, maxMs: 5000 }, 2)).toBe(4000);
    expect(pollDelay({ startMs: 1000, factor: 2, maxMs: 5000 }, 5)).toBe(5000);
  });

  it('repeats while the value is active and stops when done', () => {
    const server = jobServer(3);
    const values: number[] = [];
    let completed = false;
    poll({ request: server.request, isActive: (job) => job.status === 'running', delay: 1000, retry: false }).subscribe({ next: (job) => values.push(job.step), complete: () => (completed = true) });
    expect(values).toEqual([1]);
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(1000);
    expect(values).toEqual([1, 2, 3]);
    expect(completed).toBe(true);
  });

  it('honours maxAttempts, initial values and skipped errors', () => {
    const server = jobServer(10, 2);
    const values: number[] = [];
    poll({ request: server.request, isActive: () => true, delay: 100, maxAttempts: 3, skipErrors: true, retry: false, initial: { status: 'running', step: 0 } }).subscribe((job) => values.push(job.step));
    expect(values).toEqual([]);
    vi.advanceTimersByTime(1000);
    expect(values).toEqual([1, 3]);
    expect(server.calls()).toBe(3);
  });

  it('pauses while the page is hidden', () => {
    const server = jobServer(10);
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    poll({ request: server.request, isActive: () => true, delay: 100, retry: false }).subscribe();
    vi.advanceTimersByTime(1000);
    expect(server.calls()).toBe(1);
    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(server.calls()).toBe(2);
    visibility.mockRestore();
  });

  it('refreshes on a timer without overlap and skips errors', () => {
    let calls = 0;
    let enabled = true;
    const values: number[] = [];
    const subscription = refreshEvery({
      delay: 1000,
      when: () => enabled,
      request: () => defer(() => (++calls === 2 ? throwError(() => new Error('x')) : of(calls))),
    }).subscribe((value) => values.push(value));
    vi.advanceTimersByTime(3000);
    enabled = false;
    vi.advanceTimersByTime(2000);
    subscription.unsubscribe();
    expect(values).toEqual([1, 3]);
  });

  it('keeps polling a hidden page when asked and retries reads by default', () => {
    const server = jobServer(2);
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const values: number[] = [];
    poll({ request: server.request, isActive: (job) => job.status === 'running', delay: 100, pauseWhenHidden: false }).subscribe((job) => values.push(job.step));
    vi.advanceTimersByTime(100);
    expect(values).toEqual([1, 2]);
    visibility.mockRestore();
  });

  it('refreshes at once, on hidden pages too, and passes errors on when asked', () => {
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    let calls = 0;
    const values: number[] = [];
    const errors: unknown[] = [];
    refreshEvery({
      delay: 1000,
      immediate: true,
      pauseWhenHidden: false,
      skipErrors: false,
      request: () => defer(() => (++calls === 2 ? throwError(() => new Error('x')) : of(calls))),
    }).subscribe({ next: (value) => values.push(value), error: (error) => errors.push(error) });
    vi.advanceTimersByTime(0);
    expect(values).toEqual([1]);
    vi.advanceTimersByTime(1000);
    expect(errors).toHaveLength(1);
    visibility.mockRestore();
  });

  it('does not poll or refresh without a document', () => {
    vi.stubGlobal('document', undefined);
    const request = vi.fn(() => of(1));
    const values: number[] = [];
    let completed = 0;
    poll({ request, isActive: () => true, delay: 100, retry: false }).subscribe({ next: (value) => values.push(value), complete: () => completed++ });
    refreshEvery({ request, delay: 100 }).subscribe({ complete: () => completed++ });
    vi.unstubAllGlobals();
    expect(values).toEqual([1]);
    expect(request).toHaveBeenCalledTimes(1);
    expect(completed).toBe(2);
  });

  it('turns errors into status and message', () => {
    expect(toPollingError(new HttpErrorResponse({ status: 409, error: { error: 'Busy' } }))).toEqual({ status: 409, message: 'Busy' });
    expect(toPollingError(new HttpErrorResponse({ status: 400, error: { message: 'Bad' } }))).toEqual({ status: 400, message: 'Bad' });
    expect(toPollingError(new HttpErrorResponse({ status: 500, error: { error: { code: 1 } } }))).toEqual({ status: 500, message: null });
    expect(toPollingError(new Error('x'))).toEqual({ status: 0, message: null });
  });

  it('runs a poller with signals, restart and stop', () => {
    const server = jobServer(2, 3);
    const poller = new TxPoller<string, Job>({ request: ({ params, attempt }) => (params === 'job-1' && attempt >= 0 ? server.request() : of({ status: 'done', step: -1 })), isActive: (job) => job.status === 'running', delay: 500, retry: false });
    const values: number[] = [];
    poller.watch('job-1').subscribe((job) => values.push(job.step));
    expect(poller.isPolling()).toBe(true);
    expect(poller.isLoading()).toBe(false);
    vi.advanceTimersByTime(500);
    expect(values).toEqual([1, 2]);
    expect(poller.isPolling()).toBe(false);

    poller.restart();
    expect(poller.error()).toEqual({ status: 500, message: 'Boom' });
    poller.stop();
    expect(poller.error()).toBeNull();
  });
});
