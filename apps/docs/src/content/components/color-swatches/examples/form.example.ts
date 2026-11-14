import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxColorSwatchOption, TxColorSwatches } from '@tectra-ng/ui/color-swatches';
import { TxField } from '@tectra-ng/ui/field';

@Component({
  selector: 'color-swatches-form-example',
  imports: [ReactiveFormsModule, TxButton, TxColorSwatches, TxField],
  template: `
    <div class="form">
      <tx-field label="Calendar color" [required]="true" [messages]="{ required: 'Pick a color' }">
        <tx-color-swatches [options]="colors" [formControl]="color" />
      </tx-field>
      <button txButton (click)="color.markAsTouched()">Create calendar</button>
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
export default class ColorSwatchesFormExample {
  readonly colors: TxColorSwatchOption[] = [
    { value: 'tomato', color: '#e5484d', label: 'Tomato' },
    { value: 'amber', color: '#f59e0b', label: 'Amber' },
    { value: 'grass', color: '#46a758', label: 'Grass' },
    { value: 'sky', color: '#0ea5e9', label: 'Sky' },
    { value: 'iris', color: '#5b5bd6', label: 'Iris' },
  ];
  readonly color = new FormControl<string | null>(null, Validators.required);
}
