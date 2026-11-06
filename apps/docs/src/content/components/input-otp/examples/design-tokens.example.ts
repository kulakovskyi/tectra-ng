import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInputOtp } from '@tectra-ng/ui/input-otp';

@Component({
  selector: 'input-otp-design-tokens-example',
  imports: [TxInputOtp],
  template: `<tx-input-otp
    [length]="4"
    [integerOnly]="true"
    ariaLabel="Wide cells"
    [dt]="{ root: { cellWidth: '56px', gap: '14px' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputOtpDesignTokensExample {}
