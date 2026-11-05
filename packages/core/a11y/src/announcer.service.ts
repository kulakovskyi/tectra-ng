import { AriaLivePoliteness, LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TxAnnouncer {
  private liveAnnouncer = inject(LiveAnnouncer);

  announce(message: string, politeness: AriaLivePoliteness = 'polite'): Promise<void> {
    return this.liveAnnouncer.announce(message, politeness);
  }

  clear(): void {
    this.liveAnnouncer.clear();
  }
}
