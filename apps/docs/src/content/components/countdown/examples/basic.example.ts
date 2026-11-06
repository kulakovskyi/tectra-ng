import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCountdown } from '@tectra-ng/ui/countdown';

@Component({
  selector: 'countdown-basic-example',
  imports: [TxCountdown, TxButton],
  template: `
    <div class="row">
      @if (running()) {
        <span
          >Redirecting in <tx-countdown [value]="5" suffix="s" (completed)="running.set(false)"
        /></span>
      } @else {
        <span>Done — this is where the redirect happens.</span>
        <button
          txButton
          label="Start again"
          variant="outlined"
          size="small"
          (click)="running.set(true)"
        ></button>
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownBasicExample {
  readonly running = signal(true);
}
