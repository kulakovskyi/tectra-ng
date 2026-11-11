import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, Signal, computed, inject, isSignal, signal } from '@angular/core';
import { MS_IN_SECOND, TxDateInput, toDate } from '@tectra-ng/utils/date';

export interface TxCountdownState {
  remainingMs: Signal<number>;
  isExpired: Signal<boolean>;
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
