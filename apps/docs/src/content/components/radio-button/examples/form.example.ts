import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxField } from '@tectra/ui/field';
import { TxRadioButton, TxRadioGroup } from '@tectra/ui/radio-button';

@Component({
  selector: 'radio-button-form-example',
  imports: [ReactiveFormsModule, TxField, TxRadioGroup, TxRadioButton, TxButton],
  template: `
    <div class="form">
      <tx-field label="How did you hear about us?" [required]="true">
        <tx-radio-group [formControl]="source">
          <tx-radio-button value="search" label="Search engine" />
          <tx-radio-button value="friend" label="A friend" />
          <tx-radio-button value="social" label="Social media" />
        </tx-radio-group>
      </tx-field>
      <button txButton (click)="source.markAsTouched()">Continue</button>
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
export default class RadioButtonFormExample {
  readonly source = new FormControl<string | null>(null, Validators.required);
}
