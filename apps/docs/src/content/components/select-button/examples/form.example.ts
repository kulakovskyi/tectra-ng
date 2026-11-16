import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-form-example',
  imports: [ReactiveFormsModule, TxField, TxSelectButton, TxButton],
  template: `
    <div class="form">
      <tx-field label="Seat class" [required]="true" hint="Pick one to continue">
        <tx-select-button [options]="seats" [formControl]="seat" />
      </tx-field>
      <div class="flex">
        <button txButton (click)="seat.markAsTouched()">Continue</button>
        <button txButton severity="secondary" variant="outlined" (click)="seat.reset()">
          Reset
        </button>
      </div>
      <span class="hint"
        >Value: {{ seat.value ?? 'none' }} · {{ seat.valid ? 'valid' : 'invalid' }}</span
      >
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonFormExample {
  readonly seats = [
    { label: 'Economy', value: 'economy' },
    { label: 'Premium', value: 'premium' },
    { label: 'Business', value: 'business' },
  ];
  readonly seat = new FormControl<string | null>(null, Validators.required);
}
