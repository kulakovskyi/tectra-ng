import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxPassword } from '@tectra-ng/ui/password';

@Component({
  selector: 'password-form-example',
  imports: [ReactiveFormsModule, TxField, TxPassword, TxButton],
  template: `
    <form class="form" [formGroup]="form" (ngSubmit)="form.markAllAsTouched()">
      <tx-field label="Password" [required]="true">
        <tx-password
          formControlName="password"
          [feedback]="true"
          [toggleMask]="true"
          autocomplete="new-password"
          [fluid]="true"
        />
      </tx-field>
      <tx-field
        label="Repeat password"
        [required]="true"
        [messages]="{ mismatch: 'The passwords do not match' }"
      >
        <tx-password
          formControlName="repeat"
          [toggleMask]="true"
          autocomplete="new-password"
          [fluid]="true"
        />
      </tx-field>
      <button txButton type="submit">Create account</button>
    </form>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
      max-width: 360px;
    }

    tx-field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordFormExample {
  readonly form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    repeat: new FormControl('', [
      Validators.required,
      (control: AbstractControl) => this.matches(control),
    ]),
  });

  private matches(control: AbstractControl): ValidationErrors | null {
    const password = control.parent?.get('password')?.value;
    return control.value && control.value !== password ? { mismatch: true } : null;
  }
}
