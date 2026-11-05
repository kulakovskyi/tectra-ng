import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxField } from '@tectra/ui/field';
import { TxSlider } from '@tectra/ui/slider';

@Component({
  selector: 'slider-form-example',
  imports: [ReactiveFormsModule, TxField, TxSlider, TxButton],
  template: `
    <div class="form">
      <tx-field label="Monthly budget, %" hint="Keep at least 20% for ads.">
        <tx-slider [formControl]="budget" />
      </tx-field>
      <button txButton (click)="budget.markAsTouched()">Save</button>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
      max-width: 360px;
    }

    tx-field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderFormExample {
  readonly budget = new FormControl(10, Validators.min(20));
}
