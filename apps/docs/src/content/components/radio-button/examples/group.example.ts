import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxRadioButton, TxRadioGroup } from '@tectra-ng/ui/radio-button';

@Component({
  selector: 'radio-button-group-example',
  imports: [ReactiveFormsModule, TxRadioGroup, TxRadioButton],
  template: `
    <tx-radio-group [formControl]="delivery" ariaLabel="Delivery">
      <tx-radio-button value="standard" label="Standard — 3 to 5 days" />
      <tx-radio-button value="express" label="Express — next day" />
      <tx-radio-button value="pickup" label="Pick up in store" />
    </tx-radio-group>
    <p class="hint">Value: {{ delivery.value }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonGroupExample {
  readonly delivery = new FormControl('standard');
}
