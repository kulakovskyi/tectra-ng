import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInputOtp } from '@tectra-ng/ui/input-otp';
import { TxMessage } from '@tectra-ng/ui/message';

@Component({
  selector: 'input-otp-form-example',
  imports: [ReactiveFormsModule, TxField, TxInputOtp, TxButton, TxMessage],
  template: `
    <div class="form">
      <tx-field
        label="Verification code"
        hint="We sent it to +380 •• ••• 42 17"
        [messages]="{ minlength: 'Enter all 6 digits' }"
      >
        <tx-input-otp
          [formControl]="code"
          [integerOnly]="true"
          [groupSize]="3"
          (completed)="verify()"
        />
      </tx-field>
      <button txButton (click)="verify()">Verify</button>
      @if (verified()) {
        <tx-message severity="success" icon="check-circle" text="Phone number confirmed." />
      }
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputOtpFormExample {
  readonly code = new FormControl('', [Validators.required, Validators.minLength(6)]);
  readonly verified = signal(false);

  verify(): void {
    this.code.markAsTouched();
    this.verified.set(this.code.valid);
  }
}
