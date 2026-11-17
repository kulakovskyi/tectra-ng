import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxAnalogClock } from '@tectra-ng/ui/analog-clock';
import { TxClock } from '@tectra-ng/utils/clock';
import { TxDatePipe } from '@tectra-ng/utils/date';

@Component({
  selector: 'clock-now-example',
  imports: [TxDatePipe, TxAnalogClock],
  template: `
    <div class="row">
      <div class="stack">
        <strong class="time">{{ clock.now() | txDate: 'HH:mm:ss' }}</strong>
        <span class="hint">{{ clock.now() | txDate: 'EEEE, d MMMM y' }}</span>
      </div>
      <tx-analog-clock
        [showSeconds]="true"
        [dt]="{ root: { size: '96px' } }"
        ariaLabel="Local time"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }
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
