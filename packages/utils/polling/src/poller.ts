import { signal } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, defer, finalize, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { poll, toPollingError } from './poll';
import { TxPollerConfig, TxPollingError } from './polling.types';

export class TxPoller<TParams, T> {
  private readonly restarts = new Subject<void>();
  private readonly stops = new Subject<void>();

  readonly isLoading = signal(false);
  readonly isPolling = signal(false);
  readonly error = signal<TxPollingError | null>(null);

  constructor(private readonly config: TxPollerConfig<TParams, T>) {}

  watch(params: TParams): Observable<T> {
    this.stops.next();
    return this.restarts.pipe(
      startWith(undefined),
      switchMap(() => this.cycle(params)),
      takeUntil(this.stops),
    );
  }

  restart(): void {
    this.restarts.next();
  }

  stop(): void {
    this.stops.next();
    this.error.set(null);
  }

  private cycle(params: TParams): Observable<T> {
    return defer(() => {
      this.isLoading.set(true);
      this.isPolling.set(true);
      this.error.set(null);
      return poll<T>({ ...this.config, request: (attempt) => this.config.request({ params, attempt }) }).pipe(
        tap(() => {
          this.isLoading.set(false);
          this.error.set(null);
        }),
        catchError((error: unknown) => {
          this.error.set(toPollingError(error));
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.isPolling.set(false);
        }),
      );
    });
  }
}
