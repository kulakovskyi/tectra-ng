import { AriaLivePoliteness, LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, inject } from '@angular/core';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { TxVisuallyHiddenStyles } from './visually-hidden.styles';

/** Announces messages to screen readers through a visually hidden live region. */
@Injectable({ providedIn: 'root' })
export class TxAnnouncer {
  private liveAnnouncer = inject(LiveAnnouncer);

  constructor() {
    inject(TxStyleLoader).load(TxVisuallyHiddenStyles);
  }

  /** Announces a message to screen readers with the given politeness (default `polite`). */
  announce(message: string, politeness: AriaLivePoliteness = 'polite'): Promise<void> {
    return this.liveAnnouncer.announce(message, politeness);
  }

  /** Clears the live region. */
  clear(): void {
    this.liveAnnouncer.clear();
  }
}
