import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra/core/forms';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra/icons';
import { TectraDeepPartial, TectraToggleSwitchTokens, toStyleObject } from '@tectra/themes';
import { TxToggleSwitchHandleTemplate } from './toggle-switch-templates.directive';
import { TxToggleSwitchChangeEvent, TxToggleSwitchLabelPosition, TxToggleSwitchPart, TxToggleSwitchSize } from './toggle-switch.types';

@Component({
  selector: 'tx-toggle-switch',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './toggle-switch.component.html',
  styleUrl: './toggle-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxToggleSwitch), multi: true }],
  host: {
    class: 'tx-toggle-switch',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-label-position]': 'labelPosition()',
    '[class.tx-toggle-switch--checked]': 'checked()',
    '[class.tx-toggle-switch--disabled]': 'isDisabled()',
    '[class.tx-toggle-switch--readonly]': 'readonly()',
    '[class.tx-toggle-switch--invalid]': 'isInvalid()',
  },
})
export class TxToggleSwitch extends TxFormControlBase<unknown> {
  private txIconRegistry = inject(TxIconRegistry);
  private generatedId = uniqueId('tx-toggle-switch');

  readonly label = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly labelPosition = input<TxToggleSwitchLabelPosition>('end');
  readonly trueValue = input<unknown>(true);
  readonly falseValue = input<unknown>(false);
  readonly onIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly offIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly size = input<TxToggleSwitchSize>('medium');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  readonly dt = input<TectraDeepPartial<TectraToggleSwitchTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxToggleSwitchPart, TxToggleSwitch> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxToggleSwitchChangeEvent>();

  readonly handleTemplate = contentChild(TxToggleSwitchHandleTemplate);
  readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('toggleSwitch', this, this.pt, this.ptOptions);
  readonly isInvalid = injectFieldInvalid(this.invalid);

  readonly resolvedId = computed(() => this.inputId() ?? this.generatedId);
  readonly descriptionId = `${this.generatedId}-description`;
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly checked = computed(() => this.value() === this.trueValue());
  readonly handleIcon = computed(() => (this.checked() ? this.onIcon() : this.offIcon()));
  readonly handleIconName = computed(() => {
    const icon = this.handleIcon();
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-toggle-switch'), ...this.passThrough().root?.style }));

  override writeValue(value: unknown): void {
    super.writeValue(value === undefined || value === null ? this.falseValue() : value);
  }

  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  onInputClick(event: MouseEvent): void {
    if (this.readonly()) {
      event.preventDefault();
    }
  }

  onInputChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const value = checked ? this.trueValue() : this.falseValue();
    this.updateValue(value);
    this.changed.emit({ checked, value, originalEvent: event });
  }

  onBlur(): void {
    this.markTouched();
  }
}
