import { Observable } from 'rxjs';
import { TxHttpRetryOptions } from '@tectra-ng/utils/http';

/** A pause that grows with each poll. */
export interface TxPollBackoff {
  /** First pause in ms. */
  startMs: number;
  /** Multiplier applied to the pause after each poll. */
  factor: number;
  /** Longest pause in ms. */
  maxMs: number;
}

/** Pause between polls: a fixed number of ms or a growing back-off. */
export type TxPollDelay = number | TxPollBackoff;

/** Shared options of `poll` and `TxPoller`: when to go on, how long to wait and how to handle errors. */
export interface TxPollOptions<T> {
  /** Tells from a response whether the job is still running; polling stops when it returns `false`. */
  isActive: (value: T) => boolean;
  /** Pause between polls (default: back-off from 2 s by 1.5 up to 15 s). */
  delay?: TxPollDelay;
  /** Most polls after the first request (default: no limit). */
  maxAttempts?: number;
  /** Retry settings for failed reads; `false` turns retries off (default: the `retryHttpReads` defaults). */
  retry?: TxHttpRetryOptions | false;
  /** Ignores a failed poll and tries again instead of ending with the error (default `false`). */
  skipErrors?: boolean;
  /** Waits while the tab is hidden (default `true`). */
  pauseWhenHidden?: boolean;
}

/** Config of `poll`: the request and the shared options. */
export interface TxPollConfig<T> extends TxPollOptions<T> {
  /** Loads the state of the job; gets the number of the attempt, starting at 0. */
  request: (attempt: number) => Observable<T>;
  /** A response already known: polling starts from it instead of the first request. */
  initial?: T;
}

/** What `TxPoller` passes to its request. */
export interface TxPollerRequest<TParams> {
  /** Parameters given to `start`. */
  params: TParams;
  /** Number of the attempt, starting at 0. */
  attempt: number;
}

/** Config of `TxPoller`: the request and the shared options. */
export interface TxPollerConfig<TParams, T> extends TxPollOptions<T> {
  /** Loads the state of the job from the parameters and the attempt number. */
  request: (data: TxPollerRequest<TParams>) => Observable<T>;
}

/** Error of a polling request in a simple form. */
export interface TxPollingError {
  /** HTTP status, `0` when there was no response. */
  status: number;
  /** Message from the response body, or `null`. */
  message: string | null;
}

/** Config of `refreshEvery`: what to load and how often. */
export interface TxRefreshEveryConfig<T> {
  /** Loads fresh data; the next call waits until it ends. */
  request: () => Observable<T>;
  /** Pause between loads in ms. */
  delay: number;
  /** Skips a tick while it returns `false`. */
  when?: () => boolean;
  /** Loads at once instead of after the first pause (default `false`). */
  immediate?: boolean;
  /** Skips ticks while the tab is hidden (default `true`). */
  pauseWhenHidden?: boolean;
  /** Ignores a failed load and goes on (default `true`). */
  skipErrors?: boolean;
}
