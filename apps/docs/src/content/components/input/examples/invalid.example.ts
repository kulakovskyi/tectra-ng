import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxFluid } from '@tectra-ng/core/fluid';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'input-invalid-example',
  imports: [TxFluid, TxInput, ReactiveFormsModule],
  template: `
    <tx-fluid class="stack">
      <input
        txInput
        placeholder="Email — leave empty and click outside"
        aria-label="Email"
        [formControl]="email"
      />
      <input txInput [invalid]="true" value="Forced invalid" aria-label="Forced invalid" />
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputInvalidExample {
  readonly email = new FormControl('', [Validators.required, Validators.email]);
}
