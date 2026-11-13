import { Directive, DestroyRef, Signal, booleanAttribute, computed, contentChild, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { TxTypeahead, nextListIndex, uniqueId } from '@tectra-ng/core/a11y';
import { TxFormControlBase } from '@tectra-ng/core/forms';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxOptionList, TxOptionRange } from './option-list.component';
import {
  TxSelectEmptyFilterTemplate,
  TxSelectEmptyTemplate,
  TxSelectFooterTemplate,
  TxSelectGroupTemplate,
  TxSelectHeaderTemplate,
  TxSelectOptionTemplate,
} from './select-option-template.directive';
import { buildOptionRows, isSelectableRow, sameOptionValue } from './select-options';
import { TxSelectFilterMatchMode, TxOptionFields, TxSelectFilterEvent, TxSelectItem, TxSelectLazyLoadEvent, TxSelectRow } from './select.types';

/** Shared base of select-like components: option fields, grouping, filter and lazy loading. */
@Directive()
export abstract class TxOptionsBase<T> extends TxFormControlBase<T> {
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string>('value');
  readonly optionDisabled = input<string>('disabled');
  readonly group = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly optionGroupLabel = input<string>('label');
  readonly optionGroupChildren = input<string>('items');
  readonly dataKey = input<string | undefined>(undefined);
  readonly filter = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterMatchMode = input<TxSelectFilterMatchMode>('contains');
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterDelay = input<number>(0);
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly lazy = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly virtualScroll = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input<number>(35);
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly emptyFilterMessage = input<string | undefined>(undefined);

  readonly filtered = output<TxSelectFilterEvent>();
  readonly lazyLoad = output<TxSelectLazyLoadEvent>();

  readonly optionTemplate = contentChild(TxSelectOptionTemplate);
  readonly groupTemplate = contentChild(TxSelectGroupTemplate);
  readonly headerTemplate = contentChild(TxSelectHeaderTemplate);
  readonly footerTemplate = contentChild(TxSelectFooterTemplate);
  readonly emptyTemplate = contentChild(TxSelectEmptyTemplate);
  readonly emptyFilterTemplate = contentChild(TxSelectEmptyFilterTemplate);
  readonly optionList = viewChild(TxOptionList);

  readonly translations = injectTranslations();
  readonly listboxId = uniqueId('tx-listbox');
  readonly query = signal('');
  readonly activeIndex = signal(-1);

  protected abstract readonly source: Signal<readonly unknown[]>;
  protected readonly selectionFull: Signal<boolean> = computed(() => false);
  protected abstract isSelected(value: unknown): boolean;
  protected abstract activate(item: TxSelectItem): void;
  protected abstract isListActive(): boolean;

  private typeahead = new TxTypeahead();
  private filterTimer: ReturnType<typeof setTimeout> | null = null;
  private lastLazyRange = '';
  private readonly clearTimers = inject(DestroyRef).onDestroy(() => this.filterTimer && clearTimeout(this.filterTimer));

  private readonly fields = computed<TxOptionFields>(() => ({
    label: this.optionLabel(),
    value: this.optionValue(),
    disabled: this.optionDisabled(),
    groupLabel: this.optionGroupLabel(),
    groupChildren: this.optionGroupChildren(),
    dataKey: this.dataKey(),
  }));
  private readonly filterFields = computed(() =>
    (this.filterBy() ?? '')
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean),
  );

  readonly allRows = computed(() => this.buildRows(''));
  protected readonly localQuery: Signal<string> = computed(() => (this.filter() && !this.lazy() ? this.query().trim() : ''));
  readonly rows = computed(() => (this.localQuery() ? this.buildRows(this.localQuery()) : this.allRows()));
  readonly selectableItems = computed(() => this.rows().filter(isSelectableRow));
  readonly activeItemId = computed(() => {
    const row = this.isListActive() ? this.rows()[this.activeIndex()] : undefined;
    return row?.type === 'option' ? row.id : null;
  });
  readonly emptyText = computed(() =>
    this.query().trim()
      ? (this.emptyFilterMessage() ?? this.translations().emptyMessage)
      : (this.emptyMessage() ?? this.translations().emptyMessage),
  );

  constructor() {
    super();
    effect(() => {
      this.rows();
      untracked(() => {
        if (this.isListActive() && this.activeIndex() >= 0 && !isSelectableRow(this.rows()[this.activeIndex()])) {
          this.activeIndex.set(this.rows().findIndex(isSelectableRow));
        }
      });
    });
  }

  onRangeChange(range: TxOptionRange): void {
    this.requestLazy(range.start, range.end);
  }

  onFilterInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.rows().findIndex(isSelectableRow));
    this.optionList()?.scrollToTop();
    this.emitFilter();
  }

  protected sameValue(a: unknown, b: unknown): boolean {
    return sameOptionValue(a, b, this.dataKey());
  }

  protected resetActive(preferSelected: boolean, fallbackToFirst = true): void {
    const rows = this.rows();
    const selected = preferSelected ? rows.findIndex((row) => isSelectableRow(row) && row.selected) : -1;
    this.activeIndex.set(selected >= 0 ? selected : fallbackToFirst ? rows.findIndex(isSelectableRow) : -1);
  }

  protected resetLazyRange(): void {
    this.lastLazyRange = '';
  }

  protected moveActive(key: string): boolean {
    const rows = this.rows();
    const options = { count: rows.length, current: this.activeIndex(), isDisabled: (index: number) => !isSelectableRow(rows[index]) };
    let next = nextListIndex(key, options);
    if (next !== null && !isSelectableRow(rows[next])) {
      const forward = key === 'PageDown' ? 'ArrowDown' : 'ArrowUp';
      const backward = forward === 'ArrowDown' ? 'ArrowUp' : 'ArrowDown';
      const stepped = nextListIndex(forward, { ...options, current: next, loop: false });
      next = stepped !== null && isSelectableRow(rows[stepped]) ? stepped : nextListIndex(backward, { ...options, current: next, loop: false });
    }
    if (next !== null && isSelectableRow(rows[next])) {
      this.activeIndex.set(next);
      this.scrollActiveIntoView();
      return true;
    }
    return false;
  }

  protected findByTyping(key: string): TxSelectItem | null {
    const rows = this.rows();
    const found = this.typeahead.search(
      key,
      rows.map((row) => (isSelectableRow(row) ? row.label : '')),
      this.activeIndex(),
    );
    const row = found === null ? undefined : rows[found];
    if (found === null || !isSelectableRow(row)) {
      return null;
    }
    this.activeIndex.set(found);
    return row;
  }

  protected scrollActiveIntoView(): void {
    this.optionList()?.scrollToIndex(this.activeIndex());
  }

  protected emitFilter(): void {
    if (this.filterTimer) {
      clearTimeout(this.filterTimer);
      this.filterTimer = null;
    }
    const query = this.query();
    if (this.filterDelay() > 0) {
      this.filterTimer = setTimeout(() => {
        this.filterTimer = null;
        this.filtered.emit({ query });
      }, this.filterDelay());
    } else {
      this.filtered.emit({ query });
    }
  }

  protected requestLazy(start: number, end: number): void {
    if (!this.lazy()) {
      return;
    }
    const loaders = this.rows()
      .slice(start, end)
      .filter((row) => row.type === 'loader');
    if (!loaders.length) {
      return;
    }
    const event = { first: loaders[0].index, last: loaders[loaders.length - 1].index + 1, query: this.query() };
    const key = `${event.first}:${event.last}:${event.query}`;
    if (key !== this.lastLazyRange) {
      this.lastLazyRange = key;
      this.lazyLoad.emit(event);
    }
  }

  private buildRows(query: string): TxSelectRow[] {
    return buildOptionRows({
      options: this.source(),
      fields: this.fields(),
      group: this.group(),
      idPrefix: this.listboxId,
      query,
      filterFields: this.filterFields(),
      matchMode: this.filterMatchMode(),
      isSelected: (value) => this.isSelected(value),
      isBlocked: (value) => this.selectionFull() && !this.isSelected(value),
    });
  }
}
