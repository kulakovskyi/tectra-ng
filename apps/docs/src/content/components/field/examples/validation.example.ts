import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMessage } from '@tectra-ng/ui/message';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'field-validation-example',
  imports: [ReactiveFormsModule, TxField, TxInput, TxSelect, TxButton, TxMessage],
  template: `
    <form class="form" [formGroup]="form" (ngSubmit)="submit()">
      <tx-field label="Email" [required]="true">
        <input txInput type="email" formControlName="email" [fluid]="true" />
      </tx-field>
      <tx-field label="Team size" [required]="true">
        <tx-select [options]="sizes" formControlName="size" placeholder="Choose" />
      </tx-field>
      <button txButton type="submit">Continue</button>
      @if (isSent()) {
        <tx-message severity="success" icon="check-circle" text="Thanks — we will be in touch." />
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

    tx-field,
    tx-message {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldValidationExample {
  readonly sizes = [
    { label: '1–10', value: 'small' },
    { label: '11–50', value: 'medium' },
    { label: '51+', value: 'large' },
  ];
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    size: new FormControl<string | null>(null, Validators.required),
  });
  readonly isSent = signal(false);

  submit(): void {
    this.form.markAllAsTouched();
    this.isSent.set(this.form.valid);
  }
}
