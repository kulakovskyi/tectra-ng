import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountdown } from '@tectra-ng/ui/countdown';

@Component({
  selector: 'countdown-target-example',
  imports: [TxCountdown],
  template: `
    <div class="offer">
      <span class="label">Offer ends in</span>
      <tx-countdown class="time" [target]="midnight" />
    </div>
  `,
  styles: `
    .offer {
      display: inline-flex;
      align-items: baseline;
      gap: 10px;
    }
    .label {
      color: var(--tx-text-muted);
      font-size: 14px;
    }
    .time {
      font-size: 28px;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownTargetExample {
  readonly midnight = new Date(new Date().setHours(24, 0, 0, 0));
}
