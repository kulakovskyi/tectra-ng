import { Observable } from 'rxjs';
import { TxHttpRetryOptions } from '@tectra-ng/utils/http';

export interface TxPollBackoff {
  startMs: number;
  factor: number;
  maxMs: number;
}

export type TxPollDelay = number | TxPollBackoff;

export interface TxPollOptions<T> {
  isActive: (value: T) => boolean;
  delay?: TxPollDelay;
  maxAttempts?: number;
  retry?: TxHttpRetryOptions | false;
  skipErrors?: boolean;
  pauseWhenHidden?: boolean;
}

export interface TxPollConfig<T> extends TxPollOptions<T> {
  request: (attempt: number) => Observable<T>;
  initial?: T;
}

export interface TxPollerRequest<TParams> {
  params: TParams;
  attempt: number;
}

export interface TxPollerConfig<TParams, T> extends TxPollOptions<T> {
  request: (data: TxPollerRequest<TParams>) => Observable<T>;
}

export interface TxPollingError {
  status: number;
  message: string | null;
}

export interface TxRefreshEveryConfig<T> {
  request: () => Observable<T>;
  delay: number;
  when?: () => boolean;
  immediate?: boolean;
  pauseWhenHidden?: boolean;
  skipErrors?: boolean;
}
