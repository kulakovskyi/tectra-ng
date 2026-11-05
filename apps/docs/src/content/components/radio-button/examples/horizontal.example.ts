import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRadioButton, TxRadioGroup } from '@tectra/ui/radio-button';

@Component({
  selector: 'radio-button-horizontal-example',
  imports: [FormsModule, TxRadioGroup, TxRadioButton],
  template: `
    <tx-radio-group orientation="horizontal" ariaLabel="Billing period" [(ngModel)]="period">
      <tx-radio-button value="month" label="Monthly" />
      <tx-radio-button value="year" label="Yearly" />
    </tx-radio-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonHorizontalExample {
  period = 'year';
}
