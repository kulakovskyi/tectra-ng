import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra/core/forms';
import { optionalBoolean, optionalNumber } from '@tectra/core/utils';
import { TectraDeepPartial, TectraRadioButtonTokens, toStyleObject } from '@tectra/themes';
import { TX_RADIO_GROUP } from './radio-group.token';
import { TxRadioButtonChangeEvent, TxRadioButtonPart, TxRadioButtonSize, TxRadioButtonVariant } from './radio-button.types';

@Component({
  selector: 'tx-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxRadioButton), multi: true }],
  host: {
    class: 'tx-radio-button',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-variant]': 'resolvedVariant()',
    '[class.tx-radio-button--checked]': 'checked()',
    '[class.tx-radio-button--disabled]': 'isDisabled()',
    '[class.tx-radio-button--readonly]': 'readonly()',
    '[class.tx-radio-button--invalid]': 'isInvalid()',
    '[class.tx-radio-button--tile]': 'tile()',
    '(click)': 'onHostClick($event)',
  },
})
export class TxRadioButton extends TxFormControlBase<unknown> {
  private group = inject(TX_RADIO_GROUP, { optional: true });
  private generatedId = uniqueId('tx-radio-button');

  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly optionValue = input<unknown>(undefined, { alias: 'value' });
  readonly label = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly size = input<TxRadioButtonSize | undefined>(undefined);
  readonly variant = input<TxRadioButtonVariant | undefined>(undefined);
  readonly tile = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly dt = input<TectraDeepPartial<TectraRadioButtonTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxRadioButtonPart, TxRadioButton> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxRadioButtonChangeEvent>();

  readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('radioButton', this, this.pt, this.ptOptions);
  private ownInvalid = injectFieldInvalid(this.invalid);

  readonly resolvedId = computed(() => this.inputId() ?? this.generatedId);
  readonly descriptionId = `${this.generatedId}-description`;
  readonly resolvedName = computed(() => this.group?.name() ?? this.name());
  readonly resolvedSize = computed(() => this.size() ?? this.group?.size() ?? 'medium');
  readonly resolvedVariant = computed(() => this.variant() ?? this.group?.variant() ?? 'outlined');
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput() || !!this.group?.isDisabled());
  readonly isInvalid = computed(() => this.ownInvalid() || !!this.group?.isInvalid());
  readonly isRequired = computed(() => this.required() || !!this.group?.isRequired());
  readonly checked = computed(() => (this.group ? this.group.isChecked(this.optionValue()) : this.value() === this.optionValue()));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-radio-button'), ...this.passThrough().root?.style }));

  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  onInputClick(event: MouseEvent): void {
    if (this.readonly()) {
      event.preventDefault();
    }
  }

  onInputChange(event: Event): void {
    if (this.group) {
      this.group.select(this.optionValue(), event);
    } else {
      this.updateValue(this.optionValue());
    }
    this.changed.emit({ value: this.optionValue(), originalEvent: event });
  }

  onBlur(): void {
    this.markTouched();
    this.group?.touch();
  }

  onHostClick(event: MouseEvent): void {
    if (!this.tile() || this.isDisabled()) {
      return;
    }
    if (!(event.target as HTMLElement).closest('label, input, a, button')) {
      this.inputRef().nativeElement.click();
    }
  }
}
