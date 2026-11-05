import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputOtp } from '@tectra/ui/input-otp';

@Component({
  selector: 'input-otp-states-example',
  imports: [FormsModule, TxInputOtp],
  template: `
    <div class="list">
      <tx-input-otp [length]="4" [disabled]="true" ariaLabel="Disabled" [ngModel]="'1234'" />
      <tx-input-otp [length]="4" [readonly]="true" ariaLabel="Read only" [ngModel]="'1234'" />
      <tx-input-otp [length]="4" [invalid]="true" ariaLabel="Invalid" [ngModel]="'12'" />
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
export default class InputOtpStatesExample {}
