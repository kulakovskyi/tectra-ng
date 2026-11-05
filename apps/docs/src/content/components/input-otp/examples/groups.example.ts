import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInputOtp } from '@tectra/ui/input-otp';

@Component({
  selector: 'input-otp-groups-example',
  imports: [TxInputOtp],
  template: `<tx-input-otp [integerOnly]="true" [groupSize]="3" ariaLabel="Code in two groups" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputOtpGroupsExample {}
