import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { TxOverlayAnchor } from '@tectra-ng/core/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraSelectTokens, toStyleObject } from '@tectra-ng/themes';
import { TxOptionList, TxSelectBase, TxSelectItem, foldText, isSelectableRow, readOptionField } from '@tectra-ng/ui/select';
import { TxAutocompleteChangeEvent, TxAutocompleteCompleteEvent, TxAutocompleteDropdownMode, TxAutocompletePart } from './autocomplete.types';

@Component({
  selector: 'tx-autocomplete',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, TxOverlayAnchor, NgTemplateOutlet, TxIcon, TxOptionList],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxAutocomplete), multi: true }],
  host: {
    class: 'tx-autocomplete',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[class.tx-autocomplete--open]': 'isOpen()',
    '[class.tx-autocomplete--disabled]': 'disabled()',
    '[class.tx-autocomplete--invalid]': 'isInvalid()',
    '[class.tx-autocomplete--readonly]': 'readonly()',
    '[class.tx-autocomplete--filled]': 'hasValue() || !!query()',
    '[class.tx-autocomplete--multiple]': 'multiple()',
  },
})
export class TxAutocomplete extends TxSelectBase<unknown> {
  readonly suggestions = input<readonly unknown[]>([]);
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dropdown = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dropdownMode = input<TxAutocompleteDropdownMode>('blank');
  readonly dropdownIcon = input<TxIconName>('chevron-down');
  readonly forceSelection = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly localSearch = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly delay = input<number>(300);
  readonly minLength = input<number>(1);
  readonly completeOnFocus = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly autoOptionFocus = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showEmptyMessage = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly maxlength = input<number | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraSelectTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAutocompletePart, TxAutocomplete> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly completed = output<TxAutocompleteCompleteEvent>();
  readonly changed = output<TxAutocompleteChangeEvent>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('autocomplete', this, this.pt, this.ptOptions);
  protected readonly source = this.suggestions;
  protected override readonly localQuery = computed(() => (this.localSearch() ? this.query().trim() : ''));
  private readonly known = signal<TxSelectItem[]>([]);
  private completeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly clearComplete = inject(DestroyRef).onDestroy(() => this.completeTimer && clearTimeout(this.completeTimer));

  readonly selectedValues = computed<unknown[]>(() => {
    const value = this.value();
    if (this.multiple()) {
      return Array.isArray(value) ? value : [];
    }
    return value === null || value === undefined || value === '' ? [] : [value];
  });
  readonly selectedItems = computed<TxSelectItem[]>(() => {
    const loaded = this.allRows().filter((row): row is TxSelectItem => row.type === 'option');
    return this.selectedValues().map(
      (value, index) =>
        loaded.find((item) => this.sameValue(item.value, value)) ??
        this.known().find((item) => this.sameValue(item.value, value)) ?? {
          type: 'option',
          id: `${this.listboxId}-value-${index}`,
          index: -1,
          label: this.labelOf(value),
          value,
          option: value,
          selected: true,
          disabled: false,
        },
    );
  });
  readonly hasValue = computed(() => this.selectedValues().length > 0);
  readonly showPanel = computed(() => this.isPanelMounted() && (this.rows().length > 0 || this.loading() || this.showEmptyMessage()));
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-select'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly panelStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().panel?.style }));

  protected override get typingTarget(): boolean {
    return true;
  }

  override writeValue(value: unknown): void {
    super.writeValue(this.multiple() ? (Array.isArray(value) ? value : []) : value);
    if (!this.multiple()) {
      this.query.set(this.labelOf(value));
    }
  }

  override open(): void {
    super.open();
    if (this.autoOptionFocus()) {
      this.resetActive(true);
    } else {
      this.activeIndex.set(-1);
    }
  }

  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    if (!this.multiple() && !this.forceSelection()) {
      const folded = foldText(text.trim());
      const match = folded ? this.allRows().find((row): row is TxSelectItem => isSelectableRow(row) && foldText(row.label) === folded) : undefined;
      if (match) {
        this.remember(match);
      }
      const value = match ? match.value : text || null;
      this.updateValue(value);
      this.changed.emit({ value, option: match?.option ?? null, selected: !!match });
    } else if (!this.multiple() && !text) {
      this.updateValue(null);
    }
    if (text.trim().length >= this.minLength()) {
      this.search(text);
    } else {
      this.cancelSearch();
      this.close();
    }
  }

  onFocus(): void {
    if (this.completeOnFocus() && !this.isOpen()) {
      this.search(this.query());
    }
  }

  onBlur(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && (this.panel()?.nativeElement.contains(next) || this.box().nativeElement.contains(next))) {
      return;
    }
    this.settleText();
  }

  onDropdownClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isOpen()) {
      this.close();
    } else {
      this.search(this.dropdownMode() === 'current' ? this.query() : '', true);
    }
    this.focusTrigger();
  }

  override onBoxClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.tx-select__clear, .tx-select__chip-remove, .tx-autocomplete__dropdown')) {
      this.focusTrigger();
    }
  }

  override close(): void {
    this.cancelSearch();
    super.close();
  }

  removeItem(item: TxSelectItem, event: Event): void {
    event.stopPropagation();
    if (this.disabled() || this.readonly()) {
      return;
    }
    const values = this.selectedValues().filter((value) => !this.sameValue(value, item.value));
    this.updateValue(values);
    this.changed.emit({ value: values, option: item.option, selected: false });
  }

  protected isSelected(value: unknown): boolean {
    return this.selectedValues().some((selected) => this.sameValue(selected, value));
  }

  protected activate(item: TxSelectItem): void {
    if (item.disabled) {
      return;
    }
    this.remember(item);
    if (this.multiple()) {
      const values = item.selected ? this.selectedValues() : [...this.selectedValues(), item.value];
      this.updateValue(values);
      this.query.set('');
      this.changed.emit({ value: values, option: item.option, selected: true });
    } else {
      this.updateValue(item.value);
      this.query.set(item.label);
      this.changed.emit({ value: item.value, option: item.option, selected: true });
    }
    this.close();
    this.focusTrigger();
  }

  protected clearValue(): void {
    this.query.set('');
    const value = this.multiple() ? [] : null;
    this.updateValue(value);
    this.changed.emit({ value, option: null, selected: false });
  }

  protected onTypeaheadClosed(): void {
    return;
  }

  protected handleExtraKey(event: KeyboardEvent): boolean {
    if (event.key === 'Enter' && !this.isOpen()) {
      return true;
    }
    if (event.key === 'ArrowDown' && !this.isOpen()) {
      event.preventDefault();
      this.search(this.query(), true);
      return true;
    }
    if (event.key === 'Backspace' && this.multiple() && !this.query()) {
      const last = this.selectedItems().at(-1);
      if (last) {
        this.removeItem(last, event);
      }
      return true;
    }
    if (event.key === 'Tab') {
      this.settleText();
    }
    return false;
  }

  protected ignoreBoxClick(): boolean {
    return true;
  }

  private search(query: string, immediately = false): void {
    this.cancelSearch();
    const run = () => {
      this.completeTimer = null;
      this.completed.emit({ query });
      this.resetLazyRange();
      if (!this.isOpen()) {
        this.open();
      }
    };
    if (immediately || this.delay() <= 0) {
      run();
    } else {
      this.completeTimer = setTimeout(run, this.delay());
    }
  }

  private cancelSearch(): void {
    if (this.completeTimer) {
      clearTimeout(this.completeTimer);
      this.completeTimer = null;
    }
  }

  private settleText(): void {
    if (this.multiple()) {
      if (this.forceSelection()) {
        this.query.set('');
      }
      return;
    }
    const selected = this.selectedItems()[0];
    if (this.forceSelection() && (!selected || selected.label !== this.query())) {
      const folded = foldText(this.query().trim());
      const match = folded ? this.allRows().find((row): row is TxSelectItem => isSelectableRow(row) && foldText(row.label) === folded) : undefined;
      if (match) {
        this.activate(match);
        return;
      }
      this.query.set('');
      if (this.value() !== null) {
        this.updateValue(null);
        this.changed.emit({ value: null, option: null, selected: false });
      }
    }
  }

  private remember(item: TxSelectItem): void {
    this.known.update((known) => [...known.filter((entry) => !this.sameValue(entry.value, item.value)), item]);
  }

  private labelOf(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    const item =
      this.allRows().find((row): row is TxSelectItem => row.type === 'option' && this.sameValue(row.value, value)) ??
      this.known().find((entry) => this.sameValue(entry.value, value));
    if (item) {
      return item.label;
    }
    return typeof value === 'object' ? String(readOptionField(value, this.optionLabel()) ?? '') : String(value);
  }
}
