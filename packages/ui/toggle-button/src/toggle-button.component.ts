import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectFluid } from '@tectra/core/fluid';
import { TxRipple } from '@tectra/core/ripple';
import { TxFormControlBase } from '@tectra/core/forms';
import { optionalBoolean, optionalNumber } from '@tectra/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra/icons';
import { TectraDeepPartial, TectraToggleButtonTokens, toStyleObject } from '@tectra/themes';
import {
  TxToggleButtonChangeEvent,
  TxToggleButtonIconPosition,
  TxToggleButtonPart,
  TxToggleButtonSize,
} from './toggle-button.types';

@Component({
  selector: 'tx-toggle-button',
  imports: [TxIcon, TxRipple],
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
  private txIconRegistry = inject(TxIconRegistry);

  readonly onLabel = input<string>('Yes');
  readonly offLabel = input<string>('No');
  readonly onIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly offIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly iconPos = input<TxToggleButtonIconPosition>('left');
  readonly size = input<TxToggleButtonSize>('medium');
  readonly allowEmpty = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly invalid = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly tabindex = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraToggleButtonTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxToggleButtonPart, TxToggleButton> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  changed = output<TxToggleButtonChangeEvent>();

  isUnstyled = injectUnstyled(this.unstyled);
  isFluid = injectFluid(this.fluid);
  passThrough = injectPassThrough('toggleButton', this, this.pt, this.ptOptions);

  readonly checked = computed(() => !!this.value());
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly label = computed(() => (this.checked() ? this.onLabel() : this.offLabel()));
  readonly currentIcon = computed(() => (this.checked() ? this.onIcon() : this.offIcon()));
  readonly iconName = computed(() => {
    const icon = this.currentIcon();
    return this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-toggle-button'), ...this.passThrough().root?.style }));

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
