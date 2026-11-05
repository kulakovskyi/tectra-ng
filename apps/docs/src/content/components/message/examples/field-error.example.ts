import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxInput } from '@tectra/ui/input';
import { TxLabel } from '@tectra/ui/label';
import { TxFieldError, TxMessage } from '@tectra/ui/message';

@Component({
  selector: 'message-field-error-example',
  imports: [ReactiveFormsModule, TxLabel, TxInput, TxFieldError, TxButton, TxMessage],
  template: `
    <form class="form" [formGroup]="form" (ngSubmit)="submit()">
      <div>
        <tx-label for="error-email" [required]="true">Email</tx-label>
        <input txInput id="error-email" type="email" formControlName="email" [fluid]="true" />
        <tx-field-error for="error-email" [control]="form.controls.email" />
      </div>
      <div>
        <tx-label for="error-password" [required]="true">Password</tx-label>
        <input
          txInput
          id="error-password"
          type="password"
          formControlName="password"
          [fluid]="true"
        />
        <tx-field-error for="error-password" [control]="form.controls.password" />
      </div>
      <button txButton type="submit">Create account</button>
      @if (isSent()) {
        <tx-message severity="success" icon="check-circle" text="Account created." />
      }
    </form>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
      max-width: 360px;
    }

    .form > div,
    tx-message {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageFieldErrorExample {
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });
  readonly isSent = signal(false);

  submit(): void {
    this.form.markAllAsTouched();
    this.isSent.set(this.form.valid);
  }
}
