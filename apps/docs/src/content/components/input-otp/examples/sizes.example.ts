import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInputOtp } from '@tectra-ng/ui/input-otp';

@Component({
  selector: 'input-otp-sizes-example',
  imports: [TxInputOtp],
  template: `
    <div class="list">
      <tx-input-otp size="small" [length]="4" ariaLabel="Small" />
      <tx-input-otp [length]="4" ariaLabel="Medium" />
      <tx-input-otp size="large" [length]="4" ariaLabel="Large" />
      <tx-input-otp variant="filled" [length]="4" ariaLabel="Filled" />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputOtpSizesExample {}
