import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountdown, TxCountdownValue } from '@tectra-ng/ui/countdown';

@Component({
  selector: 'countdown-template-example',
  imports: [TxCountdown, TxCountdownValue],
  template: `
    <tx-countdown [target]="launch">
      <ng-template
        txCountdownValue
        let-days="days"
        let-hours="hours"
        let-minutes="minutes"
        let-seconds="seconds"
      >
        <span class="blocks">
          @for (part of [days, hours, minutes, seconds]; track $index) {
            <span class="block">
              <strong>{{ $index ? (part < 10 ? '0' + part : part) : part }}</strong>
              <small>{{ labels[$index] }}</small>
            </span>
          }
        </span>
      </ng-template>
    </tx-countdown>
  `,
  styles: `
    .blocks {
      display: inline-flex;
      gap: 8px;
    }
    .block {
      display: grid;
      justify-items: center;
      min-width: 56px;
      padding: 8px 6px;
      border: 1px solid var(--tx-surface-border);
      border-radius: 10px;
      background: var(--tx-surface-card);
    }
    strong {
      font-size: 22px;
    }
    small {
      color: var(--tx-text-muted);
      font-size: 11px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownTemplateExample {
  readonly launch = new Date(Date.now() + ((3 * 24 + 5) * 60 + 42) * 60000);
  readonly labels = ['days', 'hours', 'minutes', 'seconds'];
}
