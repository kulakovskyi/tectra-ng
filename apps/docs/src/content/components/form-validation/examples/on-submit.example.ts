import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxScrollToInvalid } from '@tectra-ng/utils/form-validation';

@Component({
  selector: 'form-validation-on-submit-example',
  imports: [ReactiveFormsModule, TxButton, TxField, TxInput, TxMultiselect, TxScrollToInvalid],
  template: `
    <form
      class="form"
      [formGroup]="form"
      txScrollToInvalid
      (validSubmit)="status.set('Invite sent to ' + form.value.email)"
      (invalidSubmit)="status.set('Check the form.')"
    >
      <tx-field label="Email" [control]="form.controls.email">
        <input txInput type="email" formControlName="email" [fluid]="true" />
      </tx-field>
      <tx-field label="Teams" [control]="form.controls.teams">
        <tx-multiselect formControlName="teams" placeholder="Pick teams" [options]="teams" />
      </tx-field>
      <div class="flex">
        <button txButton type="submit" label="Send invite"></button>
        <span class="hint">{{ status() }}</span>
      </div>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 400px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormValidationOnSubmitExample {
  readonly teams = ['Design', 'Platform', 'Support', 'Sales'];
  readonly status = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    teams: new FormControl<string[]>([], {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
}
