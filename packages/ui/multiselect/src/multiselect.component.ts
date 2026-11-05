import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChild, forwardRef, input, output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName } from '@tectra/icons';
import { TectraDeepPartial, TectraSelectTokens, toStyleObject } from '@tectra/themes';
import { TxOptionList, TxSelectBase, TxSelectItem, TxSelectValueTemplate, isSelectableRow } from '@tectra/ui/select';
import { TxMultiselectChangeEvent, TxMultiselectDisplay, TxMultiselectPart } from './multiselect.types';

@Component({
  selector: 'tx-multiselect',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, NgTemplateOutlet, TxIcon, TxOptionList],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxMultiselect), multi: true }],
  host: {
    class: 'tx-multiselect',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-display]': 'display()',
    '[class.tx-multiselect--open]': 'isOpen()',
    '[class.tx-multiselect--disabled]': 'disabled()',
    '[class.tx-multiselect--invalid]': 'isInvalid()',
    '[class.tx-multiselect--readonly]': 'readonly()',
    '[class.tx-multiselect--filled]': 'hasValue()',
  },
})
export class TxMultiselect extends TxSelectBase<unknown[]> {
  readonly options = input<readonly unknown[]>([]);
  readonly display = input<TxMultiselectDisplay>('comma');
  readonly maxSelectedLabels = input<number>(3);
  readonly selectedItemsLabel = input<string | undefined>(undefined);
  readonly selectionLimit = input<number | undefined>(undefined);
  readonly showToggleAll = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly dropdownIcon = input<TxIconName>('chevron-down');
  readonly dt = input<TectraDeepPartial<TectraSelectTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxMultiselectPart, TxMultiselect> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxMultiselectChangeEvent>();

  readonly valueTemplate = contentChild(TxSelectValueTemplate);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('multiselect', this, this.pt, this.ptOptions);
  protected readonly source = this.options;
  private readonly known = signal<TxSelectItem[]>([]);

  readonly selectedValues = computed<unknown[]>(() => {
    const value = this.value();
    return Array.isArray(value) ? value : [];
  });
  readonly selectedItems = computed<TxSelectItem[]>(() => {
    const loaded = this.allRows().filter((row): row is TxSelectItem => row.type === 'option');
    const known = this.known();
    return this.selectedValues()
      .map((value) => loaded.find((item) => this.sameValue(item.value, value)) ?? known.find((item) => this.sameValue(item.value, value)))
      .filter((item): item is TxSelectItem => !!item);
  });
  readonly hasValue = computed(() => this.selectedValues().length > 0);
  protected override readonly selectionFull = computed(() => {
    const limit = this.selectionLimit();
    return limit !== undefined && this.selectedValues().length >= limit;
  });
  readonly summarized = computed(() => this.selectedItems().length > this.maxSelectedLabels());
  readonly summary = computed(() =>
    (this.selectedItemsLabel() ?? this.translations().selectedItems).replace('{count}', String(this.selectedValues().length)),
  );
  readonly commaText = computed(() => this.selectedItems().map((item) => item.label).join(', '));
  readonly allChecked = computed(() => ({ all: 'true', some: 'mixed', none: 'false' })[this.allState()]);
  readonly allState = computed<'all' | 'some' | 'none'>(() => {
    const items = this.rows().filter((row): row is TxSelectItem => row.type === 'option' && (!row.disabled || row.selected));
    const selected = items.filter((item) => item.selected).length;
    return selected === 0 ? 'none' : selected === items.length ? 'all' : 'some';
  });
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-select'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly panelStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().panel?.style }));

  override writeValue(value: unknown[] | null): void {
    super.writeValue(Array.isArray(value) ? value : []);
  }

  toggleItem(item: TxSelectItem): void {
    if (item.disabled && !item.selected) {
      return;
    }
    const selected = !item.selected;
    const values = selected ? [...this.selectedValues(), item.value] : this.selectedValues().filter((value) => !this.sameValue(value, item.value));
    if (selected) {
      this.known.update((known) => [...known.filter((entry) => !this.sameValue(entry.value, item.value)), item]);
    }
    this.updateValue(values);
    this.changed.emit({ value: values, option: item.option, selected });
  }

  toggleAll(): void {
    const selecting = this.allState() !== 'all';
    const items = this.rows().filter((row): row is TxSelectItem => row.type === 'option');
    let values: unknown[];
    if (!selecting) {
      values = this.selectedValues().filter((value) => !items.some((item) => item.selected && !item.disabled && this.sameValue(item.value, value)));
    } else {
      const room = (this.selectionLimit() ?? Infinity) - this.selectedValues().length;
      const added = items.filter((item) => isSelectableRow(item) && !item.selected).slice(0, Math.max(0, room));
      this.known.update((known) => [...known, ...added]);
      values = [...this.selectedValues(), ...added.map((item) => item.value)];
    }
    this.updateValue(values);
    this.changed.emit({ value: values, option: null, selected: selecting });
  }

  removeItem(item: TxSelectItem, event: Event): void {
    event.stopPropagation();
    if (this.disabled() || this.readonly()) {
      return;
    }
    this.toggleItem({ ...item, selected: true, disabled: false });
  }

  protected isSelected(value: unknown): boolean {
    return this.selectedValues().some((selected) => this.sameValue(selected, value));
  }

  protected activate(item: TxSelectItem): void {
    this.toggleItem(item);
  }

  protected clearValue(): void {
    this.updateValue([]);
    this.changed.emit({ value: [], option: null, selected: false });
  }

  protected onTypeaheadClosed(): void {
    this.open();
  }

  protected handleExtraKey(event: KeyboardEvent, typing: boolean): boolean {
    if (this.isOpen() && !typing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      this.toggleAll();
      return true;
    }
    if (!this.isOpen() && !typing && event.key === 'Backspace' && this.display() === 'chip') {
      const last = this.selectedItems().at(-1);
      if (last) {
        event.preventDefault();
        this.removeItem(last, event);
      }
      return true;
    }
    return false;
  }

  protected ignoreBoxClick(): boolean {
    return false;
  }

  protected override onEnterWithoutOption(): void {
    return;
  }
}
