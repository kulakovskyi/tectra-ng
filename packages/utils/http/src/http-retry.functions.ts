import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { MonoTypeOperatorFunction, retry, throwError, timer } from 'rxjs';
import { TxHttpRetryDelay, TxHttpRetryOptions } from './http.types';

export const TX_HTTP_RETRY_COUNT = 5;
export const TX_HTTP_RETRY_BASE_DELAY_MS = 2000;
export const TX_HTTP_RETRY_MAX_DELAY_MS = 30000;
export const TX_HTTP_RETRY_FACTOR = 2;
/** Status `0` that the browser reports when a request got no response. */
export const TX_HTTP_NETWORK_ERROR_STATUS = 0;
export const TX_HTTP_RETRYABLE_STATUSES: readonly number[] = [
  TX_HTTP_NETWORK_ERROR_STATUS,
  HttpStatusCode.TooManyRequests,
  HttpStatusCode.BadGateway,
  HttpStatusCode.ServiceUnavailable,
  HttpStatusCode.GatewayTimeout,
];

export function parseRetryAfter(value: string | null | undefined, now: number = Date.now()): number | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  const seconds = Number(trimmed);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }
  const date = Date.parse(trimmed);
  return Number.isNaN(date) ? null : Math.max(0, date - now);
}

export function httpRetryDelay(data: TxHttpRetryDelay): number | null {
  const retryAfter = parseRetryAfter(data.error.headers?.get('Retry-After'));
  if (retryAfter !== null) {
    return retryAfter > data.maxDelayMs ? null : retryAfter;
  }
  return Math.min(data.baseDelayMs * TX_HTTP_RETRY_FACTOR ** (data.attempt - 1), data.maxDelayMs);
}

export function retryHttpReads<T>(options: TxHttpRetryOptions = {}): MonoTypeOperatorFunction<T> {
  const {
    count = TX_HTTP_RETRY_COUNT,
    baseDelayMs = TX_HTTP_RETRY_BASE_DELAY_MS,
    maxDelayMs = TX_HTTP_RETRY_MAX_DELAY_MS,
    statuses = TX_HTTP_RETRYABLE_STATUSES,
  } = options;
  return retry({
    count,
    delay: (error: unknown, attempt: number) => {
      if (!(error instanceof HttpErrorResponse) || !statuses.includes(error.status)) {
        return throwError(() => error);
      }
      const delayMs = httpRetryDelay({ error, attempt, baseDelayMs, maxDelayMs });
      return delayMs === null ? throwError(() => error) : timer(delayMs);
    },
  });
}
