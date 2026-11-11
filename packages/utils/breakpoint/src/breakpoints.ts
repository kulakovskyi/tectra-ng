import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, Signal, inject, signal } from '@angular/core';

export const TX_BREAKPOINT_MOBILE = '(max-width: 640px)';
export const TX_BREAKPOINT_TABLET = '(max-width: 768px)';

@Injectable({ providedIn: 'root' })
export class TxBreakpoints {
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly destroyRef = inject(DestroyRef);
  private readonly queries = new Map<string, Signal<boolean>>();

  readonly isMobile = this.matches(TX_BREAKPOINT_MOBILE);
  readonly isTablet = this.matches(TX_BREAKPOINT_TABLET);

  matches(query: string): Signal<boolean> {
    const known = this.queries.get(query);
    if (known) {
      return known;
    }
    const list = this.view?.matchMedia?.(query);
    const state = signal(list?.matches ?? false);
    if (list) {
      const listener = (event: MediaQueryListEvent) => state.set(event.matches);
      list.addEventListener('change', listener);
      this.destroyRef.onDestroy(() => list.removeEventListener('change', listener));
    }
    const readonly = state.asReadonly();
    this.queries.set(query, readonly);
    return readonly;
  }
}
