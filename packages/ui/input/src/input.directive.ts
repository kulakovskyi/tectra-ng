import { Directive, inject, input } from '@angular/core';
import { injectFieldInvalid } from '@tectra/core/forms';
import { TxStyleLoader } from '@tectra/core/styles';
import { optionalBoolean } from '@tectra/core/utils';
import { TxInputStyles } from './input.styles';
import { TxFieldVariant, TxInputSize } from './input.types';

@Directive({
  selector: 'input[txInput], textarea[txInput]',
  host: {
    class: 'tx-input',
    '[class.tx-input--invalid]': 'isInvalid()',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
  },
})
export class TxInput {
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly size = input<TxInputSize>('medium');
  readonly variant = input<TxFieldVariant>('outlined');

  readonly isInvalid = injectFieldInvalid(this.invalid);

  constructor() {
    inject(TxStyleLoader).load(TxInputStyles);
  }
}
