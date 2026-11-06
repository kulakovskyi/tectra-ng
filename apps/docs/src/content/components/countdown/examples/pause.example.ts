import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCountdown } from '@tectra-ng/ui/countdown';

@Component({
  selector: 'countdown-pause-example',
  imports: [TxCountdown, TxButton],
  template: `
    <div class="row">
      <tx-countdown
        class="time"
        format="clock"
        [value]="3"
        unit="minutes"
        [paused]="paused()"
        (completed)="paused.set(true)"
      />
      <button
        txButton
        variant="outlined"
        size="small"
        [icon]="paused() ? 'play' : 'pause'"
        [label]="paused() ? 'Resume' : 'Pause'"
        (click)="paused.set(!paused())"
      ></button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .time {
      min-width: 64px;
      font-size: 24px;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownPauseExample {
  readonly paused = signal(false);
}
