import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'field-success-example',
  imports: [ReactiveFormsModule, TxField, TxInput],
  template: `
    <div class="form">
      <tx-field label="Username" successText="Available" [messages]="messages">
        <input txInput [formControl]="username" placeholder="At least 3 letters" [fluid]="true" />
      </tx-field>
    </div>
  `,
  styles: `
    .form {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldSuccessExample {
  readonly username = new FormControl('', [Validators.required, Validators.minLength(3)]);
  readonly messages = { minlength: 'Use at least {requiredLength} letters' };
}
