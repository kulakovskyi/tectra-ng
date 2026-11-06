import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputMask } from '@tectra-ng/ui/input-mask';

@Component({
  selector: 'input-mask-date-example',
  imports: [TxInput, TxInputMask],
  template: `<input
    txInput
    txInputMask="99.99.9999"
    slotChar="dd.mm.yyyy"
    inputmode="numeric"
    placeholder="dd.mm.yyyy"
    aria-label="Date of birth"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputMaskDateExample {}
