import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputOtp } from '@tectra/ui/input-otp';

@Component({
  selector: 'input-otp-basic-example',
  imports: [FormsModule, TxInputOtp],
  template: `
    <tx-input-otp ariaLabel="Code" [(ngModel)]="code" />
    <p class="hint">Value: {{ code || '—' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputOtpBasicExample {
  code = '';
}
