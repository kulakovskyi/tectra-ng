import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxValidators } from '@tectra-ng/utils/validators';

@Component({
  selector: 'validators-confirmation-example',
  imports: [ReactiveFormsModule, TxButton, TxField, TxInput],
  template: `
    <div class="stack">
      <tx-field label="Type DELETE to remove the project" [control]="confirm">
        <input txInput [formControl]="confirm" autocomplete="off" [fluid]="true" />
      </tx-field>
      <div>
        <button
          txButton
          label="Delete project"
          severity="danger"
          [disabled]="confirm.invalid"
          (click)="deleted.set(true)"
        ></button>
      </div>
      @if (deleted()) {
        <span class="hint">Deleted (not really).</span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ValidatorsConfirmationExample {
  readonly deleted = signal(false);
  readonly confirm = new FormControl('', [Validators.required, TxValidators.exactValue('DELETE')]);
}
