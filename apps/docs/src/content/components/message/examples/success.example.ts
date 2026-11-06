import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxFieldError } from '@tectra-ng/ui/message';

@Component({
  selector: 'message-success-example',
  imports: [ReactiveFormsModule, TxLabel, TxInput, TxFieldError],
  template: `
    <div class="field">
      <tx-label for="success-code">Promo code</tx-label>
      <input
        txInput
        id="success-code"
        [formControl]="code"
        placeholder="6 letters or digits"
        [fluid]="true"
      />
      <tx-field-error
        for="success-code"
        [control]="code"
        [successText]="'Code applied — 10% off'"
      />
    </div>
  `,
  styles: `
    .field {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageSuccessExample {
  readonly code = new FormControl('', [
    Validators.required,
    Validators.pattern(/^[A-Za-z0-9]{6}$/),
  ]);
}
