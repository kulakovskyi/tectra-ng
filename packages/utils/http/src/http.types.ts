import { HttpErrorResponse } from '@angular/common/http';

/** Options of `retryHttpReads`. */
export interface TxHttpRetryOptions {
  /** How many times to retry (default 5). */
  count?: number;
  /** Delay before the first retry in ms, doubled each time (default 2000). */
  baseDelayMs?: number;
  /** Longest delay in ms; a `Retry-After` above it stops the retries (default 30000). */
  maxDelayMs?: number;
  /** Statuses that are retried (default: no response, 429, 502, 503 and 504). */
  statuses?: readonly number[];
}

/** Input of the retry delay calculation for one failed attempt. */
export interface TxHttpRetryDelay {
  /** The failed response; its `Retry-After` header wins over the back-off. */
  error: HttpErrorResponse;
  /** Number of the retry, starting at 1. */
  attempt: number;
  /** Delay before the first retry in ms. */
  baseDelayMs: number;
  /** Longest allowed delay in ms. */
  maxDelayMs: number;
}

/**
 * Kind of an HTTP response: `ok`, `redirect`, `clientError`, `serverError`, `warning`, `noResponse` or
 * `unknown`.
 */
export type TxHttpStatusGroup = 'ok' | 'redirect' | 'clientError' | 'serverError' | 'warning' | 'noResponse' | 'unknown';

/** Colour tone that fits an HTTP status: `success`, `info`, `warn`, `danger` or `secondary`. */
export type TxHttpStatusTone = 'success' | 'info' | 'warn' | 'danger' | 'secondary';
