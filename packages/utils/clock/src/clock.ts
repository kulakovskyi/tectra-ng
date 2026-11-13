import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, Signal, computed, inject, isSignal, signal } from '@angular/core';
import { MS_IN_SECOND, TxDateInput, toDate } from '@tectra-ng/utils/date';

/** Signals of a countdown created by `TxClock.countdown`. */
export interface TxCountdownState {
  /** Milliseconds left until the target, never below 0. */
  remainingMs: Signal<number>;
  /** `true` once the target has passed. */
  isExpired: Signal<boolean>;
  /** `true` while the time left is above 0 and within the `endingSoonMs` of the countdown. */
  isEndingSoon: Signal<boolean>;
}

@Injectable({ providedIn: 'root' })
export class TxClock {
  private readonly current = signal(Date.now());

  readonly now = this.current.asReadonly();

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const timer = setInterval(() => this.current.set(Date.now()), MS_IN_SECOND);
      inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }
  }

  countdown(target: Signal<TxDateInput> | TxDateInput, endingSoonMs = 0): TxCountdownState {
    const targetTime = computed(() => toDate(isSignal(target) ? target() : target)?.getTime() ?? null);
    const remainingMs = computed(() => {
      const time = targetTime();
      return time === null ? 0 : Math.max(0, time - this.now());
    });
    return {
      remainingMs,
      isExpired: computed(() => targetTime() !== null && remainingMs() === 0),
      isEndingSoon: computed(() => remainingMs() > 0 && remainingMs() <= endingSoonMs),
    };
  }

  isInFuture(value: TxDateInput): boolean {
    const time = toDate(value)?.getTime();
    return time !== undefined && time > this.now();
  }
}
