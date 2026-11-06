import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountdown } from '@tectra-ng/ui/countdown';

@Component({
  selector: 'countdown-design-tokens-example',
  imports: [TxCountdown],
  template: `<tx-countdown
    class="time"
    [value]="45"
    format="clock"
    [endingSoon]="40000"
    [dt]="{ root: { fontWeight: '700', endingColor: 'var(--tx-warn-base)' } }"
  />`,
  styles: `
    .time {
      font-size: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownDesignTokensExample {}
