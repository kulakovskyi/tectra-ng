import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-invalid-example',
  imports: [TxInput, ReactiveFormsModule],
  template: `
    <input
      txInput
      placeholder="Email (required)"
      [formControl]="email"
      [invalid]="email.invalid && email.touched"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputInvalidExample {
  email = new FormControl('', [Validators.required, Validators.email]);
}
