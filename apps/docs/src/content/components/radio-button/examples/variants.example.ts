import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadioButton, TxRadioGroup } from '@tectra/ui/radio-button';

@Component({
  selector: 'radio-button-variants-example',
  imports: [TxRadioGroup, TxRadioButton],
  template: `
    <tx-radio-group variant="filled" orientation="horizontal" ariaLabel="Filled">
      <tx-radio-button value="a" label="Filled" />
      <tx-radio-button value="b" label="Filled" />
    </tx-radio-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonVariantsExample {}
