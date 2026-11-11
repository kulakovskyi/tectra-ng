import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxRemainingTimePipe } from '@tectra-ng/ui/countdown';
import { TxTag } from '@tectra-ng/ui/tag';
import { TxClock } from '@tectra-ng/utils/clock';

@Component({
  selector: 'clock-countdown-example',
  imports: [TxButton, TxRemainingTimePipe, TxTag],
  template: `
    <div class="flex">
      <button txButton label="Start a 30 s offer" (click)="start()"></button>
      @if (endsAt()) {
        <tx-tag
          [severity]="offer.isExpired() ? 'secondary' : offer.isEndingSoon() ? 'danger' : 'success'"
          [value]="
            offer.isExpired() ? 'Offer ended' : 'Ends in ' + (offer.remainingMs() | txRemainingTime)
          "
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClockCountdownExample {
  private readonly clock = inject(TxClock);

  readonly endsAt = signal<number | null>(null);
  readonly offer = this.clock.countdown(this.endsAt, 20_000);

  start(): void {
    this.endsAt.set(Date.now() + 30_000);
  }
}
