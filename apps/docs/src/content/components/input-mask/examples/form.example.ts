import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputMask } from '@tectra-ng/ui/input-mask';

@Component({
  selector: 'input-mask-form-example',
  imports: [ReactiveFormsModule, TxField, TxInput, TxInputMask, TxButton],
  template: `
    <div class="form">
      <tx-field label="Phone" [required]="true" hint="We call only about your order.">
        <input
          txInput
          txInputMask="+380 (99) 999-99-99"
          inputmode="tel"
          [formControl]="phone"
          [fluid]="true"
        />
      </tx-field>
      <button txButton (click)="phone.markAsTouched()">Order</button>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
      max-width: 320px;
    }

    tx-field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputMaskFormExample {
  readonly phone = new FormControl('', Validators.required);
}
