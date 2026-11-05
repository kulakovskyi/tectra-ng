import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, forwardRef, input, output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectFieldInvalid } from '@tectra/core/forms';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon } from '@tectra/icons';
import { TectraDeepPartial, TectraListboxTokens, toStyleObject } from '@tectra/themes';
import { TxOptionList, TxOptionsBase, TxSelectItem, isSelectableRow } from '@tectra/ui/select';
import { TxListboxChangeEvent, TxListboxPart } from './listbox.types';

@Component({
  selector: 'tx-listbox',
  imports: [NgTemplateOutlet, TxIcon, TxOptionList],
  templateUrl: './listbox.component.html',
  styleUrl: './listbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxListbox), multi: true }],
  host: {
    class: 'tx-listbox',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-listbox--focused]': 'focused()',
    '[class.tx-listbox--disabled]': 'disabled()',
    '[class.tx-listbox--invalid]': 'isInvalid()',
    '[class.tx-listbox--readonly]': 'readonly()',
    '(mousedown)': 'onPointer($event)',
  },
})
export class TxListbox extends TxOptionsBase<unknown> {
  readonly options = input<readonly unknown[]>([]);
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly checkbox = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly metaKeySelection = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly checkmark = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraListboxTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxListboxPart, TxListbox> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxListboxChangeEvent>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('listbox', this, this.pt, this.ptOptions);
  readonly focused = signal(false);
  protected readonly source = this.options;
  private replaceOnClick = false;

  readonly isMultiple = computed(() => this.multiple() || this.checkbox());
  readonly selectedValues = computed<unknown[]>(() => {
    const value = this.value();
    if (this.isMultiple()) {
      return Array.isArray(value) ? value : [];
    }
    return value === null || value === undefined ? [] : [value];
  });
  readonly shownActiveIndex = computed(() => (this.focused() ? this.activeIndex() : -1));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-listbox'), ...this.passThrough().root?.style }));

  onPointer(event: MouseEvent): void {
    this.replaceOnClick = this.isMultiple() && this.metaKeySelection() && !(event.ctrlKey || event.metaKey);
  }

  onListFocus(): void {
    this.focused.set(true);
    if (!isSelectableRow(this.rows()[this.activeIndex()])) {
      this.resetActive(true);
    }
  }

  onListBlur(): void {
    this.focused.set(false);
    this.markTouched();
  }

  onOptionClick(item: TxSelectItem): void {
    this.activeIndex.set(this.rows().indexOf(item));
    if (this.replaceOnClick) {
      this.replaceOnClick = false;
      this.commit([item.value], item);
      return;
    }
    this.activate(item);
  }

  onListKeydown(event: KeyboardEvent): void {
    const typing = (event.target as HTMLElement).classList.contains('tx-listbox__filter-input');
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'PageDown' || event.key === 'PageUp' || (!typing && (event.key === 'Home' || event.key === 'End'))) {
      event.preventDefault();
      if (!this.focused() && !isSelectableRow(this.rows()[this.activeIndex()])) {
        this.resetActive(true);
      }
      if (this.moveActive(event.key) && event.shiftKey && this.isMultiple()) {
        const active = this.rows()[this.activeIndex()];
        if (isSelectableRow(active) && !active.selected) {
          this.activate(active);
        }
      }
      return;
    }
    if (event.key === 'Enter' || (event.key === ' ' && !typing)) {
      const active = this.rows()[this.activeIndex()];
      if (isSelectableRow(active)) {
        event.preventDefault();
        this.activate(active);
      }
      return;
    }
    if (!typing && this.isMultiple() && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      this.toggleAll();
      return;
    }
    if (!typing && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (this.findByTyping(event.key)) {
        this.scrollActiveIntoView();
      }
    }
  }

  onFilterFocus(): void {
    this.focused.set(true);
    if (!isSelectableRow(this.rows()[this.activeIndex()])) {
      this.resetActive(true);
    }
  }

  toggleAll(): void {
    if (this.readonly() || this.disabled()) {
      return;
    }
    const items = this.rows().filter(isSelectableRow);
    const allSelected = items.every((item) => item.selected);
    const values = allSelected
      ? this.selectedValues().filter((value) => !items.some((item) => this.sameValue(item.value, value)))
      : [...this.selectedValues(), ...items.filter((item) => !item.selected).map((item) => item.value)];
    this.commit(values, null);
  }

  protected isListActive(): boolean {
    return this.focused();
  }

  protected isSelected(value: unknown): boolean {
    return this.selectedValues().some((selected) => this.sameValue(selected, value));
  }

  protected activate(item: TxSelectItem): void {
    if (this.readonly() || this.disabled() || item.disabled) {
      return;
    }
    if (!this.isMultiple()) {
      if (!item.selected) {
        this.commit([item.value], item);
      }
      return;
    }
    const values = item.selected ? this.selectedValues().filter((value) => !this.sameValue(value, item.value)) : [...this.selectedValues(), item.value];
    this.commit(values, item);
  }

  private commit(values: unknown[], item: TxSelectItem | null): void {
    const value = this.isMultiple() ? values : (values[0] ?? null);
    this.updateValue(value);
    this.changed.emit({ value, option: item?.option ?? null });
  }
}
