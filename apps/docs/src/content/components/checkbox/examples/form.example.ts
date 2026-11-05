import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxCheckbox } from '@tectra/ui/checkbox';
import { TxField } from '@tectra/ui/field';

@Component({
  selector: 'checkbox-form-example',
  imports: [ReactiveFormsModule, TxCheckbox, TxField, TxButton],
  template: `
    <div class="form">
      <tx-field [messages]="{ required: 'Please accept the terms to continue' }">
        <tx-checkbox label="I accept the terms of service" [formControl]="terms" />
      </tx-field>
      <button txButton (click)="terms.markAsTouched()">Create account</button>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxFormExample {
  readonly terms = new FormControl(false, Validators.requiredTrue);
}
