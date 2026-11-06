import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInputOtp } from '@tectra-ng/ui/input-otp';

@Component({
  selector: 'input-otp-mask-example',
  imports: [TxInputOtp],
  template: `<tx-input-otp [length]="4" [mask]="true" [integerOnly]="true" ariaLabel="PIN" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputOtpMaskExample {}
