import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInputOtp } from '@tectra-ng/ui/input-otp';

@Component({
  selector: 'input-otp-length-example',
  imports: [TxInputOtp],
  template: `<tx-input-otp [length]="8" [groupSize]="4" ariaLabel="Recovery code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputOtpLengthExample {}
