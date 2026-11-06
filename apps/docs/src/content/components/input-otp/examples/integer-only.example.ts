import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxInputOtp } from '@tectra-ng/ui/input-otp';

@Component({
  selector: 'input-otp-integer-only-example',
  imports: [TxInputOtp],
  template: `
    <tx-input-otp [integerOnly]="true" ariaLabel="Six digit code" (completed)="done.set($event)" />
    <p class="hint">{{ done() ? 'Completed: ' + done() : 'Waiting for 6 digits' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputOtpIntegerOnlyExample {
  readonly done = signal('');
}
