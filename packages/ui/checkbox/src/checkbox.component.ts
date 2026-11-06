import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra-ng/icons';
import { TectraCheckboxTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TX_CHECKBOX_GROUP } from './checkbox-group.token';
import { TxCheckboxIconTemplate } from './checkbox-templates.directive';
import { TxCheckboxChangeEvent, TxCheckboxPart, TxCheckboxSize, TxCheckboxVariant } from './checkbox.types';

@Component({
  selector: 'tx-checkbox',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxCheckbox), multi: true }],
  host: {
    class: 'tx-checkbox',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-variant]': 'resolvedVariant()',
    '[class.tx-checkbox--checked]': 'checked()',
    '[class.tx-checkbox--indeterminate]': 'indeterminate() && !checked()',
    '[class.tx-checkbox--disabled]': 'isDisabled()',
    '[class.tx-checkbox--readonly]': 'readonly()',
    '[class.tx-checkbox--invalid]': 'isInvalid()',
    '[class.tx-checkbox--tile]': 'tile()',
    '(click)': 'onHostClick($event)',
  },
})
export class TxCheckbox extends TxFormControlBase<unknown> {
  private txIconRegistry = inject(TxIconRegistry);
  private group = inject(TX_CHECKBOX_GROUP, { optional: true });
  private generatedId = uniqueId('tx-checkbox');

  readonly label = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly optionValue = input<unknown>(undefined, { alias: 'value' });
  readonly binary = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly trueValue = input<unknown>(true);
  readonly falseValue = input<unknown>(false);
  readonly indeterminate = model<boolean>(false);
  readonly icon = input<TxIconName | (string & {})>('check');
  readonly indeterminateIcon = input<TxIconName | (string & {})>('minus');
  readonly size = input<TxCheckboxSize | undefined>(undefined);
  readonly variant = input<TxCheckboxVariant | undefined>(undefined);
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
  readonly dt = input<TectraDeepPartial<TectraCheckboxTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCheckboxPart, TxCheckbox> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxCheckboxChangeEvent>();

  readonly iconTemplate = contentChild(TxCheckboxIconTemplate);
  readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('checkbox', this, this.pt, this.ptOptions);
  private ownInvalid = injectFieldInvalid(this.invalid);

  readonly inGroup = computed(() => !!this.group && this.optionValue() !== undefined);
  readonly isBinary = computed(() => this.binary() ?? this.optionValue() === undefined);
  readonly resolvedId = computed(() => this.inputId() ?? this.generatedId);
  readonly descriptionId = `${this.generatedId}-description`;
  readonly resolvedName = computed(() => this.name() ?? this.group?.name());
  readonly resolvedSize = computed(() => this.size() ?? this.group?.size() ?? 'medium');
  readonly resolvedVariant = computed(() => this.variant() ?? this.group?.variant() ?? 'outlined');
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput() || !!this.group?.isDisabled());
  readonly isInvalid = computed(() => this.ownInvalid() || (this.inGroup() && !!this.group?.isInvalid()));
  readonly checked = computed(() => {
    if (this.inGroup()) {
      return !!this.group?.isChecked(this.optionValue());
    }
    const model = this.value();
    if (this.isBinary()) {
      return model === this.trueValue();
    }
    return Array.isArray(model) && model.includes(this.optionValue());
  });
  readonly iconName = computed(() => {
    const icon = this.indeterminate() && !this.checked() ? this.indeterminateIcon() : this.icon();
    return this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly iconClass = computed(() => (this.indeterminate() && !this.checked() ? this.indeterminateIcon() : this.icon()));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-checkbox'), ...this.passThrough().root?.style }));

  constructor() {
    super();
    effect((onCleanup) => {
      const value = this.optionValue();
      if (this.group && value !== undefined) {
        onCleanup(this.group.register(value));
      }
    });
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
    const next = (event.target as HTMLInputElement).checked;
    this.indeterminate.set(false);
    if (this.inGroup()) {
      this.group?.toggle(this.optionValue(), next);
      this.changed.emit({ checked: next, value: this.optionValue(), originalEvent: event });
      return;
    }
    let model: unknown;
    if (this.isBinary()) {
      model = next ? this.trueValue() : this.falseValue();
    } else {
      const current = Array.isArray(this.value()) ? (this.value() as unknown[]) : [];
      model = next ? [...current.filter((item) => item !== this.optionValue()), this.optionValue()] : current.filter((item) => item !== this.optionValue());
    }
    this.updateValue(model);
    this.changed.emit({ checked: next, value: model, originalEvent: event });
  }

  onBlur(): void {
    this.markTouched();
    this.group?.touch();
  }

  onHostClick(event: MouseEvent): void {
    if (!this.tile() || this.isDisabled()) {
      return;
    }
    const target = event.target as HTMLElement;
    if (!target.closest('label, input, a, button')) {
      this.inputRef().nativeElement.click();
    }
  }
}
