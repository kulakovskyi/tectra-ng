import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxTextarea } from '@tectra-ng/ui/textarea';
import { TxValidators } from '@tectra-ng/utils/validators';

@Component({
  selector: 'validators-formats-example',
  imports: [ReactiveFormsModule, TxField, TxInput, TxTextarea],
  template: `
    <form class="form" [formGroup]="form">
      <tx-field label="Price" [control]="form.controls.price" showImmediately>
        <input txInput formControlName="price" inputmode="decimal" [fluid]="true" />
      </tx-field>
      <tx-field label="Send at" [control]="form.controls.time" showImmediately>
        <input txInput formControlName="time" [fluid]="true" />
      </tx-field>
      <tx-field label="Headers (JSON)" [control]="form.controls.headers" showImmediately>
        <textarea txTextarea rows="2" formControlName="headers" [fluid]="true"></textarea>
      </tx-field>
      <tx-field label="Display name" [control]="form.controls.name" showImmediately>
        <input txInput formControlName="name" [fluid]="true" />
      </tx-field>
    </form>
  `,
  styles: `
    .form {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ValidatorsFormatsExample {
  readonly form = new FormGroup({
    price: new FormControl('12.999', TxValidators.price()),
    time: new FormControl('24:30', TxValidators.time24()),
    headers: new FormControl('["x-team"]', TxValidators.jsonObject()),
    name: new FormControl('<b>Ann</b>', TxValidators.noUnsafeChars()),
  });
}
