import { Directive, computed, inject, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectFluid } from '@tectra/core/fluid';
import { injectFieldInvalid } from '@tectra/core/forms';
import { TxStyleLoader } from '@tectra/core/styles';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraDeepPartial, TectraFormFieldTokens, toStyleObject } from '@tectra/themes';
import { TxInputStyles } from './input.styles';
import { TxFieldVariant, TxInputPart, TxInputSize } from './input.types';

@Directive({
  selector: 'input[txInput], textarea[txInput]',
  host: {
    class: 'tx-input',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-input--invalid]': 'isInvalid()',
    '[class.tx-input--fluid]': 'isFluid()',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
  },
})
export class TxInput {
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly size = input<TxInputSize>('medium');
  readonly variant = input<TxFieldVariant>('outlined');
  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly dt = input<TectraDeepPartial<TectraFormFieldTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxInputPart, TxInput> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isFluid = injectFluid(this.fluid);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('input', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-form-field'), ...this.passThrough().root?.style }));

  constructor() {
    inject(TxStyleLoader).load(TxInputStyles);
  }
}
