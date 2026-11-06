import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFloatLabel } from '@tectra-ng/ui/label';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-number-float-label-example',
  imports: [TxFloatLabel, TxInputNumber],
  template: `
    <tx-float-label variant="on">
      <tx-input-number inputId="number-float" mode="currency" currency="USD" />
      <label for="number-float">Monthly budget</label>
    </tx-float-label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberFloatLabelExample {}
