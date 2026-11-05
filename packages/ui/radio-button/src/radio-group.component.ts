import { ChangeDetectionStrategy, Component, booleanAttribute, computed, forwardRef, inject, input, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra/core/forms';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraDeepPartial, TectraRadioButtonTokens, toStyleObject } from '@tectra/themes';
import { TX_RADIO_GROUP, TxRadioGroupContext } from './radio-group.token';
import { TxRadioButtonSize, TxRadioButtonVariant, TxRadioGroupOrientation, TxRadioGroupPart } from './radio-button.types';

@Component({
  selector: 'tx-radio-group',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    :host([data-styled]) {
      gap: var(--tx-radio-button-group-gap);
    }

    :host([data-orientation='horizontal']) {
      flex-direction: row;
      flex-wrap: wrap;
    }

    :host([data-styled][data-orientation='horizontal']) {
      column-gap: var(--tx-radio-button-group-horizontal-gap);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxRadioGroup), multi: true },
    { provide: TX_RADIO_GROUP, useFactory: () => inject(TxRadioGroup).context },
  ],
  host: {
    class: 'tx-radio-group',
    role: 'radiogroup',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.aria-required]': 'required() || null',
    '[attr.aria-disabled]': 'isDisabled() || null',
  },
})
export class TxRadioGroup extends TxFormControlBase<unknown> {
  private generatedName = uniqueId('tx-radio-group');

  readonly name = input<string | undefined>(undefined);
  readonly orientation = input<TxRadioGroupOrientation>('vertical');
  readonly size = input<TxRadioButtonSize | undefined>(undefined);
  readonly variant = input<TxRadioButtonVariant | undefined>(undefined);
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraRadioButtonTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxRadioGroupPart, TxRadioGroup> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<unknown>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('radioGroup', this, this.pt, this.ptOptions);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly resolvedName = computed(() => this.name() ?? this.generatedName);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-radio-button'), ...this.passThrough().root?.style }));

  readonly context: TxRadioGroupContext = {
    name: this.resolvedName,
    isDisabled: this.isDisabled,
    isInvalid: this.isInvalid,
    isRequired: this.required,
    size: this.size,
    variant: this.variant,
    isChecked: (value) => this.value() === value,
    select: (value) => {
      this.updateValue(value);
      this.changed.emit(value);
    },
    touch: () => this.markTouched(),
  };
}
