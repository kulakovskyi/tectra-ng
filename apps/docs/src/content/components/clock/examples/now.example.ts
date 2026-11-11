import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxClock } from '@tectra-ng/utils/clock';
import { TxDatePipe } from '@tectra-ng/utils/date';

@Component({
  selector: 'clock-now-example',
  imports: [TxDatePipe],
  template: `
    <div class="stack">
      <strong class="time">{{ clock.now() | txDate: 'HH:mm:ss' }}</strong>
      <span class="hint">{{ clock.now() | txDate: 'EEEE, d MMMM y' }}</span>
    </div>
  `,
  styles: `
    .time {
      font-size: var(--tx-font-size-xl);
      font-variant-numeric: tabular-nums;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClockNowExample {
  readonly clock = inject(TxClock);
}
