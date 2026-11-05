import { Directive, inject, input } from '@angular/core';
import { TxStyleLoader } from '@tectra/core/styles';
import { TxInputStyles } from './input.styles';
import { TxInputSize } from './input.types';

@Directive({
  selector: 'input[txInput], textarea[txInput]',
  host: {
    class: 'tx-input',
    '[class.tx-input--invalid]': 'invalid()',
    '[attr.aria-invalid]': 'invalid() || null',
    '[attr.data-size]': 'size()',
  },
})
export class TxInput {
  invalid = input<boolean>(false);
  size = input<TxInputSize>('medium');

  constructor() {
    inject(TxStyleLoader).load(TxInputStyles);
  }
}
