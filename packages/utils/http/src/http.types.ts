import { HttpErrorResponse } from '@angular/common/http';

export interface TxHttpRetryOptions {
  count?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  statuses?: readonly number[];
}

export interface TxHttpRetryDelay {
  error: HttpErrorResponse;
  attempt: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export type TxHttpStatusGroup = 'ok' | 'redirect' | 'clientError' | 'serverError' | 'warning' | 'noResponse' | 'unknown';

export type TxHttpStatusTone = 'success' | 'info' | 'warn' | 'danger' | 'secondary';
