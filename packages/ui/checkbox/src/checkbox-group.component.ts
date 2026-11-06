import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraCheckboxTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TX_CHECKBOX_GROUP, TxCheckboxGroupContext } from './checkbox-group.token';
import { TxCheckbox } from './checkbox.component';
import { TxCheckboxGroupOrientation, TxCheckboxGroupPart, TxCheckboxSize, TxCheckboxVariant } from './checkbox.types';

@Component({
  selector: 'tx-checkbox-group',
  imports: [TxCheckbox, FormsModule],
  template: `
    @if (selectAll()) {
      <tx-checkbox
        class="tx-checkbox-group__select-all"
        [class]="passThrough().selectAll?.class"
        [style]="passThrough().selectAll?.style"
        [label]="selectAllLabel() ?? translations().selectAll"
        [binary]="true"
        [indeterminate]="isPartial()"
        [disabled]="isDisabled()"
        [size]="size()"
        [variant]="variant()"
        [unstyled]="unstyled()"
        [ngModel]="isAll()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="toggleAll($event)"
      />
    }
    <div class="tx-checkbox-group__items" [class]="passThrough().items?.class" [style]="passThrough().items?.style">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    :host([data-styled]) .tx-checkbox-group__items {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--tx-checkbox-group-gap);
    }

    :host([data-styled][data-orientation='horizontal']) .tx-checkbox-group__items {
      flex-direction: row;
      flex-wrap: wrap;
      column-gap: var(--tx-checkbox-group-horizontal-gap);
    }

    :host([data-styled]) .tx-checkbox-group__select-all {
      margin-bottom: var(--tx-checkbox-group-select-all-gap);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxCheckboxGroup), multi: true },
    { provide: TX_CHECKBOX_GROUP, useFactory: () => inject(TxCheckboxGroup).context },
  ],
  host: {
    class: 'tx-checkbox-group',
    role: 'group',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[attr.aria-invalid]': 'isInvalid() || null',
  },
})
export class TxCheckboxGroup extends TxFormControlBase<unknown[]> {
  private readonly registered = signal<unknown[]>([]);

  readonly selectAll = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly selectAllLabel = input<string | undefined>(undefined);
  readonly orientation = input<TxCheckboxGroupOrientation>('vertical');
  readonly name = input<string | undefined>(undefined);
  readonly size = input<TxCheckboxSize | undefined>(undefined);
  readonly variant = input<TxCheckboxVariant | undefined>(undefined);
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraCheckboxTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCheckboxGroupPart, TxCheckboxGroup> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<unknown[]>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('checkboxGroup', this, this.pt, this.ptOptions);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly selected = computed(() => (Array.isArray(this.value()) ? (this.value() as unknown[]) : []));
  readonly isAll = computed(() => this.registered().length > 0 && this.registered().every((item) => this.selected().includes(item)));
  readonly isPartial = computed(() => !this.isAll() && this.registered().some((item) => this.selected().includes(item)));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-checkbox'), ...this.passThrough().root?.style }));

  readonly context: TxCheckboxGroupContext = {
    name: this.name,
    isDisabled: this.isDisabled,
    isInvalid: this.isInvalid,
    size: this.size,
    variant: this.variant,
    isChecked: (value) => this.selected().includes(value),
    toggle: (value, checked) => this.toggle(value, checked),
    register: (value) => {
      this.registered.update((items) => [...items, value]);
      return () => this.registered.update((items) => items.filter((item) => item !== value));
    },
    touch: () => this.markTouched(),
  };

  toggleAll(checked: boolean): void {
    const order = this.registered();
    const rest = this.selected().filter((item) => !order.includes(item));
    this.commit(checked ? [...rest, ...order] : rest);
  }

  private toggle(value: unknown, checked: boolean): void {
    const without = this.selected().filter((item) => item !== value);
    this.commit(checked ? [...without, value] : without);
  }

  private commit(next: unknown[]): void {
    this.updateValue(next);
    this.changed.emit(next);
  }
}
