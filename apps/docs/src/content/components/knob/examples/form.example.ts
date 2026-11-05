import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxField } from '@tectra/ui/field';
import { TxKnob } from '@tectra/ui/knob';

@Component({
  selector: 'knob-form-example',
  imports: [ReactiveFormsModule, TxField, TxKnob, TxButton],
  template: `
    <div class="form">
      <tx-field label="Brightness" hint="At least 10% to stay readable.">
        <tx-knob [formControl]="brightness" valueTemplate="{value}%" />
      </tx-field>
      <button txButton (click)="brightness.markAsTouched()">Save</button>
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
export default class KnobFormExample {
  readonly brightness = new FormControl(5, Validators.min(10));
}
