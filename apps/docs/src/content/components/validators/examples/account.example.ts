import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxPassword } from '@tectra-ng/ui/password';
import { TxValidators } from '@tectra-ng/utils/validators';

@Component({
  selector: 'validators-account-example',
  imports: [ReactiveFormsModule, TxField, TxInput, TxPassword],
  template: `
    <form class="form" [formGroup]="form">
      <tx-field label="Password" [control]="form.controls.password" showImmediately>
        <tx-password
          formControlName="password"
          autocomplete="new-password"
          [toggleMask]="true"
          [feedback]="false"
          [fluid]="true"
        />
      </tx-field>
      <tx-field label="Repeat the password" [control]="form.controls.confirm" showImmediately>
        <tx-password
          formControlName="confirm"
          autocomplete="new-password"
          [feedback]="false"
          [fluid]="true"
        />
      </tx-field>
      <tx-field label="Code from the email" [control]="form.controls.code" showImmediately>
        <input txInput formControlName="code" inputmode="numeric" [fluid]="true" />
      </tx-field>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ValidatorsAccountExample {
  readonly form = new FormGroup(
    {
      password: new FormControl('secret', [Validators.required, TxValidators.strongPassword()]),
      confirm: new FormControl('secret1'),
      code: new FormControl('12a4', TxValidators.numericCode()),
    },
    { validators: TxValidators.matchFields('password', 'confirm', 'passwordMismatch') },
  );
}
