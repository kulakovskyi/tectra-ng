import { AriaLivePoliteness, LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, inject } from '@angular/core';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { TxVisuallyHiddenStyles } from './visually-hidden.styles';

@Injectable({ providedIn: 'root' })
export class TxAnnouncer {
  private liveAnnouncer = inject(LiveAnnouncer);

  constructor() {
    inject(TxStyleLoader).load(TxVisuallyHiddenStyles);
  }

  announce(message: string, politeness: AriaLivePoliteness = 'polite'): Promise<void> {
    return this.liveAnnouncer.announce(message, politeness);
  }

  clear(): void {
    this.liveAnnouncer.clear();
  }
}
