import { HttpErrorResponse } from '@angular/common/http';
import { retryHttpReads } from '@tectra-ng/utils/http';
import { EMPTY, Observable, catchError, defer, exhaustMap, expand, filter, fromEvent, map, of, switchMap, take, timer } from 'rxjs';
import { TxPollBackoff, TxPollConfig, TxPollDelay, TxPollingError, TxRefreshEveryConfig } from './polling.types';

export const TX_POLL_DEFAULT_DELAY: TxPollBackoff = { startMs: 2000, factor: 1.5, maxMs: 15000 };
export const TX_POLL_SLOW_DELAY: TxPollBackoff = { startMs: 5000, factor: 1.5, maxMs: 30000 };

interface PollState<T> {
  value: T;
  fresh: boolean;
}

const hasDocument = (): boolean => typeof document !== 'undefined';

export function pollDelay(delay: TxPollDelay, attempt: number): number {
  return typeof delay === 'number' ? delay : Math.min(delay.startMs * delay.factor ** attempt, delay.maxMs);
}

export function isPageHidden(): boolean {
  return hasDocument() && document.visibilityState === 'hidden';
}

/** Emits at once when the tab is visible, otherwise when it becomes visible again. */
export function waitUntilVisible(): Observable<void> {
  return defer(() =>
    isPageHidden()
      ? fromEvent(document, 'visibilitychange').pipe(
          filter(() => !isPageHidden()),
          take(1),
          map(() => undefined),
        )
      : of(undefined),
  );
}

export function toPollingError(error: unknown): TxPollingError {
  if (!(error instanceof HttpErrorResponse)) {
    return { status: 0, message: null };
  }
  const message: unknown = error.error?.error ?? error.error?.message;
  return { status: error.status, message: typeof message === 'string' ? message : null };
}

export function poll<T>(config: TxPollConfig<T>): Observable<T> {
  const { request, isActive, delay = TX_POLL_DEFAULT_DELAY, maxAttempts = Number.POSITIVE_INFINITY, retry = {}, skipErrors = false, pauseWhenHidden = true, initial } = config;
  const load = (attempt: number): Observable<T> => (retry === false ? request(attempt) : request(attempt).pipe(retryHttpReads(retry)));
  const first: Observable<PollState<T>> = initial !== undefined ? of({ value: initial, fresh: false }) : load(0).pipe(map((value) => ({ value, fresh: true })));

  return first.pipe(
    expand((state, index) => {
      if (!hasDocument() || !isActive(state.value) || index >= maxAttempts) {
        return EMPTY;
      }
      const next = timer(pollDelay(delay, index)).pipe(
        switchMap(() => (pauseWhenHidden ? waitUntilVisible() : of(undefined))),
        switchMap(() => load(index + 1)),
        map((value) => ({ value, fresh: true })),
      );
      return skipErrors ? next.pipe(catchError(() => of({ value: state.value, fresh: false }))) : next;
    }),
    filter((state) => state.fresh),
    map((state) => state.value),
  );
}

export function refreshEvery<T>(config: TxRefreshEveryConfig<T>): Observable<T> {
  const { request, delay, when = () => true, immediate = false, pauseWhenHidden = true, skipErrors = true } = config;
  if (!hasDocument()) {
    return EMPTY;
  }
  return timer(immediate ? 0 : delay, delay).pipe(
    filter(() => !(pauseWhenHidden && isPageHidden()) && when()),
    exhaustMap(() => (skipErrors ? request().pipe(catchError(() => EMPTY)) : request())),
  );
}
