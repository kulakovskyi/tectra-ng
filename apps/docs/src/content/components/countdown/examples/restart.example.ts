import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCountdown } from '@tectra-ng/ui/countdown';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'countdown-restart-example',
  imports: [TxCountdown, TxButton, TxSelectButton],
  template: `
    <div class="stack">
      <tx-select-button
        ariaLabel="Duration"
        [options]="durations"
        [allowEmpty]="false"
        [(value)]="duration"
      />
      <div class="row">
        <tx-countdown
          #countdown
          class="time"
          format="clock"
          unit="seconds"
          [value]="duration()"
          [restartOnChange]="false"
        />
        <button
          txButton
          variant="outlined"
          size="small"
          icon="refresh"
          label="Restart"
          (click)="countdown.restart()"
        ></button>
      </div>
    </div>
  `,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
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
export default class CountdownRestartExample {
  readonly duration = signal<unknown>(60);
  readonly durations = [
    { label: '30 s', value: 30 },
    { label: '1 min', value: 60 },
    { label: '2 min', value: 120 },
  ];
}
