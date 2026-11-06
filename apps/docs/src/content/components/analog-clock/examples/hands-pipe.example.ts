import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TxAnalogClockHandsPipe } from '@tectra-ng/ui/analog-clock';

@Component({
  selector: 'analog-clock-hands-pipe-example',
  imports: [TxAnalogClockHandsPipe],
  template: `
    @let hands = now() | txAnalogClockHands: 'Europe/Kyiv';
    <div class="row">
      <svg
        viewBox="0 0 40 40"
        width="40"
        height="40"
        role="img"
        [attr.aria-label]="'Kyiv ' + hands.time"
      >
        <circle cx="20" cy="20" r="18" class="ring" />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="10"
          class="hour"
          [attr.transform]="'rotate(' + hands.hourAngle + ' 20 20)'"
        />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="6"
          class="minute"
          [attr.transform]="'rotate(' + hands.minuteAngle + ' 20 20)'"
        />
      </svg>
      <span
        >Kyiv <strong>{{ hands.time }}</strong></span
      >
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }
    .ring {
      fill: none;
      stroke: var(--tx-surface-border);
      stroke-width: 2;
    }
    .hour,
    .minute {
      stroke-linecap: round;
    }
    .hour {
      stroke: var(--tx-text-primary);
      stroke-width: 3;
    }
    .minute {
      stroke: var(--tx-primary-base);
      stroke-width: 2;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalogClockHandsPipeExample {
  readonly now = signal(Date.now());
  private readonly timer = setInterval(() => this.now.set(Date.now()), 30000);
  private readonly stop = inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
}
