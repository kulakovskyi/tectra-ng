import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-invalid-example',
  imports: [TxInput, ReactiveFormsModule],
  template: `
    <div class="stack">
      <input txInput placeholder="Email — leave empty and click outside" aria-label="Email" [formControl]="email" />
      <input txInput [invalid]="true" value="Forced invalid" aria-label="Forced invalid" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputInvalidExample {
  readonly email = new FormControl('', [Validators.required, Validators.email]);
}
