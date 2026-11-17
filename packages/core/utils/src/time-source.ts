import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, Signal, WritableSignal, inject, signal } from '@angular/core';

/** How often a `TxTimeSource` signal changes: at each whole second or at each whole minute. */
export type TxTimeStep = 'second' | 'minute';

/** Milliseconds of each `TxTimeStep`. */
export const TX_TIME_STEP_MS: Readonly<Record<TxTimeStep, number>> = { second: 1000, minute: 60000 };

/**
 * The one time source of an app: `Date.now()` as a signal, from a single browser timer per step that every clock of the kit
 * and `TxClock` share, so they all tick together at the start of each second or minute. No timer runs on the server.
 */
@Injectable({ providedIn: 'root' })
export class TxTimeSource {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sources = new Map<TxTimeStep, Signal<number>>();
  private readonly timers = new Map<TxTimeStep, ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers.clear();
    });
  }

  /** Signal of `Date.now()`, updated at the start of every second (default) or minute in the browser; the timer of a step starts on its first call. */
  every(step: TxTimeStep = 'second'): Signal<number> {
    let source = this.sources.get(step);
    if (!source) {
      const time = signal(Date.now());
      source = time.asReadonly();
      this.sources.set(step, source);
      if (this.browser) {
        this.schedule(step, time);
      }
    }
    return source;
  }

  private schedule(step: TxTimeStep, time: WritableSignal<number>): void {
    const ms = TX_TIME_STEP_MS[step];
    this.timers.set(
      step,
      setTimeout(() => {
        time.set(Date.now());
        this.schedule(step, time);
      }, ms - (Date.now() % ms)),
    );
  }
}
