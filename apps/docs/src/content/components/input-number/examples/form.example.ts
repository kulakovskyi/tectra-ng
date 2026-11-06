import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-number-form-example',
  imports: [ReactiveFormsModule, TxField, TxInputNumber, TxButton],
  template: `
    <div class="form">
      <tx-field label="Team size" [required]="true" hint="Between 2 and 200 people.">
        <tx-input-number [formControl]="size" [showButtons]="true" [fluid]="true" />
      </tx-field>
      <button txButton (click)="size.markAsTouched()">Continue</button>
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
export default class InputNumberFormExample {
  readonly size = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(2),
    Validators.max(200),
  ]);
}
