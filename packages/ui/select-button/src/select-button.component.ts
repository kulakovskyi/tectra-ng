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
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { nextListIndex } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectFluid } from '@tectra-ng/core/fluid';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraSelectButtonTokens, toStyleObject } from '@tectra-ng/themes';
import { readOptionField, sameOptionValue } from '@tectra-ng/ui/select';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxSelectButtonItemTemplate } from './select-button-item.directive';
import { TxSelectButtonChangeEvent, TxSelectButtonPart, TxSelectButtonSize } from './select-button.types';
import { SELECT_BUTTON_THEME } from './select-button.theme';

interface SelectButtonItem {
  option: unknown;
  value: unknown;
  label: string;
  icon: string | null;
  selected: boolean;
  disabled: boolean;
}

const KEYS: Record<string, string> = { ArrowRight: 'ArrowDown', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowUp', ArrowUp: 'ArrowUp', Home: 'Home', End: 'End' };

/**
 * A segmented choice: a row of buttons in one track, one value (`radiogroup`) or several (`multiple`, toggle
 * buttons). A `ControlValueAccessor` — works with `[formControl]`, `ngModel`, signal forms and `[(value)]`.
 */
@Component({
  selector: 'tx-select-button',
  imports: [NgTemplateOutlet, TxIcon, TxTooltip],
  templateUrl: './select-button.component.html',
  styleUrl: './select-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxSelectButton), multi: true }],
  host: {
    class: 'tx-select-button',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.role]': 'multiple() ? "group" : "radiogroup"',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.aria-required]': '(!multiple() && required()) || null',
    '[attr.aria-readonly]': '(!multiple() && readonly()) || null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[class.tx-select-button--multiple]': 'multiple()',
    '[class.tx-select-button--disabled]': 'isDisabled()',
    '[class.tx-select-button--readonly]': 'readonly()',
    '[class.tx-select-button--invalid]': 'isInvalid()',
    '[class.tx-select-button--fluid]': 'isFluid()',
    '[class.tx-select-button--icon-only]': 'iconOnly()',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class TxSelectButton extends TxFormControlBase<unknown> {
  private readonly selectButtonTheme = injectTokens(SELECT_BUTTON_THEME);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly icons = injectTxIcons();

  override readonly value = model<unknown>(null);
  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string>('value');
  readonly optionDisabled = input<string>('disabled');
  readonly optionIcon = input<string>('icon');
  readonly dataKey = input<string | undefined>(undefined);
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly allowEmpty = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly iconOnly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly size = input<TxSelectButtonSize>('medium');
  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraSelectButtonTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSelectButtonPart, TxSelectButton> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxSelectButtonChangeEvent>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  readonly itemTemplate = contentChild(TxSelectButtonItemTemplate);
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('button');

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isFluid = injectFluid(this.fluid);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('selectButton', this, this.pt, this.ptOptions);
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-select-button'), ...this.passThrough().root?.style }));

  private readonly activeIndex = signal(-1);

  readonly items = computed<SelectButtonItem[]>(() => {
    const selected = this.selectedValues();
    const dataKey = this.dataKey();
    return this.options().map((option) => {
      const isObject = option !== null && typeof option === 'object';
      const value = readOptionField(option, this.optionValue());
      const icon = isObject ? readOptionField(option, this.optionIcon()) : null;
      return {
        option,
        value,
        label: String(readOptionField(option, this.optionLabel()) ?? ''),
        icon: typeof icon === 'string' && icon ? icon : null,
        selected: selected.some((current) => sameOptionValue(current, value, dataKey)),
        disabled: isObject && !!readOptionField(option, this.optionDisabled()),
      };
    });
  });

  readonly tabStop = computed(() => {
    if (this.isDisabled()) {
      return -1;
    }
    const items = this.items();
    const usable = (index: number) => index >= 0 && index < items.length && !items[index].disabled;
    const selected = items.findIndex((item) => item.selected && !item.disabled);
    const active = this.activeIndex();
    const order = this.multiple() ? [active, selected] : [selected, active];
    return order.find(usable) ?? items.findIndex((item) => !item.disabled);
  });

  private readonly selectedValues = computed<readonly unknown[]>(() => {
    const value = this.value();
    if (this.multiple()) {
      return Array.isArray(value) ? value : [];
    }
    return value === null || value === undefined ? [] : [value];
  });

  /** Moves focus to the item that takes the Tab stop: the selected one, else the first that can be picked. */
  focus(): void {
    this.buttons()[this.tabStop()]?.nativeElement.focus();
  }

  hasIcon(name: string): boolean {
    return this.icons.has(name);
  }

  onItemClick(index: number, event: Event): void {
    this.activeIndex.set(index);
    this.toggle(index, event);
  }

  onItemFocus(index: number): void {
    this.activeIndex.set(index);
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    const key = KEYS[event.key];
    if (!key) {
      return;
    }
    event.preventDefault();
    const items = this.items();
    const next = nextListIndex(key, { count: items.length, current: index, isDisabled: (position) => items[position].disabled });
    if (next === null || next === index) {
      return;
    }
    this.activeIndex.set(next);
    this.buttons()[next].nativeElement.focus();
    if (!this.multiple() && !items[next].selected) {
      this.toggle(next, event);
    }
  }

  onFocusIn(event: FocusEvent): void {
    if (!this.contains(event.relatedTarget)) {
      this.focused.emit(event);
    }
  }

  onFocusOut(event: FocusEvent): void {
    if (!this.contains(event.relatedTarget)) {
      this.markTouched();
      this.blurred.emit(event);
    }
  }

  private toggle(index: number, event: Event): void {
    const item = this.items()[index];
    if (item.disabled || this.isDisabled() || this.readonly()) {
      return;
    }
    const current = this.selectedValues();
    if (item.selected && !this.allowEmpty() && current.length <= 1) {
      return;
    }
    const dataKey = this.dataKey();
    let value: unknown;
    if (this.multiple()) {
      value = item.selected ? current.filter((entry) => !sameOptionValue(entry, item.value, dataKey)) : [...current, item.value];
    } else {
      value = item.selected ? null : item.value;
    }
    this.updateValue(value);
    this.changed.emit({ value, option: item.option, originalEvent: event });
  }

  private contains(target: EventTarget | null): boolean {
    return target instanceof Node && this.element.contains(target);
  }
}
