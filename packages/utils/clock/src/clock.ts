import { Injectable, Signal, computed, inject, isSignal } from '@angular/core';
import { TxTimeSource } from '@tectra-ng/core/utils';
import { TxDateInput, toDate } from '@tectra-ng/utils/date';

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
  readonly now: Signal<number> = inject(TxTimeSource).every('second');

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
