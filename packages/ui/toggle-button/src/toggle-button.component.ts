import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectFluid } from '@tectra/core/fluid';
import { TxFormControlBase } from '@tectra/core/forms';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName, isTxIconName } from '@tectra/icons';
import { TectraDeepPartial, TectraToggleButtonTokens, toStyleObject } from '@tectra/themes';
import {
  TxToggleButtonChangeEvent,
  TxToggleButtonIconPosition,
  TxToggleButtonPart,
  TxToggleButtonSize,
} from './toggle-button.types';

@Component({
  selector: 'tx-toggle-button',
  imports: [TxIcon],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxToggleButton), multi: true }],
  host: {
    class: 'tx-toggle-button',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-icon-pos]': 'iconPos()',
    '[class.tx-toggle-button--checked]': 'checked()',
    '[class.tx-toggle-button--disabled]': 'isDisabled()',
    '[class.tx-toggle-button--invalid]': 'invalid()',
    '[class.tx-toggle-button--fluid]': 'isFluid()',
  },
})
export class TxToggleButton extends TxFormControlBase<boolean> {
  onLabel = input<string>('Yes');
  offLabel = input<string>('No');
  onIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  offIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  iconPos = input<TxToggleButtonIconPosition>('left');
  size = input<TxToggleButtonSize>('medium');
  allowEmpty = input<boolean, unknown>(true, { transform: booleanAttribute });
  invalid = input<boolean, unknown>(false, { transform: booleanAttribute });
  fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  tabindex = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  ariaLabel = input<string | undefined>(undefined);
  dt = input<TectraDeepPartial<TectraToggleButtonTokens> | undefined>(undefined);
  pt = input<TxPassThrough<TxToggleButtonPart, TxToggleButton> | undefined>(undefined);
  ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  changed = output<TxToggleButtonChangeEvent>();

  isUnstyled = injectUnstyled(this.unstyled);
  isFluid = injectFluid(this.fluid);
  passThrough = injectPassThrough('toggleButton', this, this.pt, this.ptOptions);

  checked = computed(() => !!this.value());
  isDisabled = computed(() => this.disabled() || this.disabledInput());
  label = computed(() => (this.checked() ? this.onLabel() : this.offLabel()));
  currentIcon = computed(() => (this.checked() ? this.onIcon() : this.offIcon()));
  iconName = computed(() => {
    const icon = this.currentIcon();
    return isTxIconName(icon) ? icon : null;
  });
  hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-toggle-button'), ...this.passThrough().root?.style }));

  toggle(event: Event): void {
    if (this.isDisabled() || (this.checked() && !this.allowEmpty())) {
      return;
    }
    const checked = !this.checked();
    this.updateValue(checked);
    this.changed.emit({ originalEvent: event, checked });
  }

  onBlur(): void {
    this.markTouched();
  }
}
