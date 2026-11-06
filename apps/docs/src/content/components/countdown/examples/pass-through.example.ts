import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountdown } from '@tectra-ng/ui/countdown';

@Component({
  selector: 'countdown-pass-through-example',
  imports: [TxCountdown],
  template: `<tx-countdown [value]="90" format="clock" [pt]="pt" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownPassThroughExample {
  readonly pt = {
    root: {
      style: {
        padding: '4px 10px',
        borderRadius: '999px',
        background: 'var(--tx-surface-ground)',
        fontSize: '15px',
      },
    },
  };
}
