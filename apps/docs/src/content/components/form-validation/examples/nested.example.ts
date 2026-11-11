import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxFormValidation } from '@tectra-ng/utils/form-validation';

const item = (name = '', quantity: number | null = null) =>
  new FormGroup({
    name: new FormControl(name, { nonNullable: true, validators: Validators.required }),
    quantity: new FormControl(quantity, [Validators.required, Validators.min(1)]),
  });

@Component({
  selector: 'form-validation-nested-example',
  imports: [ReactiveFormsModule, TxButton, TxField, TxInput, TxInputNumber],
  providers: [TxFormValidation],
  template: `
    <div class="form" [formGroup]="form">
      @for (row of form.controls.items.controls; track row; let index = $index) {
        <div class="row" [formGroup]="row">
          <tx-field [label]="'Item ' + (index + 1)" [control]="row.controls.name">
            <input txInput formControlName="name" [fluid]="true" />
          </tx-field>
          <tx-field label="Quantity" [control]="row.controls.quantity">
            <tx-input-number formControlName="quantity" [min]="0" [fluid]="true" />
          </tx-field>
        </div>
      }
      <div class="flex">
        <button
          txButton
          type="button"
          label="Add item"
          severity="secondary"
          (click)="form.controls.items.push(item())"
        ></button>
        <button txButton type="button" label="Check" (click)="check()"></button>
      </div>
    </div>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 480px;
    }
    .row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormValidationNestedExample {
  private readonly validation = inject(TxFormValidation);

  readonly item = item;
  readonly form = new FormGroup({
    items: new FormArray([item('Monitor', 2), item('Keyboard', 0), item()]),
  });

  check(): void {
    this.validation.scrollToFirstInvalid(this.form);
  }
}
