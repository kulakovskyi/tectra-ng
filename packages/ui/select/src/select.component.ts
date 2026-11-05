import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedOverlayPositionChange, createRepositionScrollStrategy } from '@angular/cdk/overlay';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxTypeahead, nextListIndex, uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra/core/forms';
import { injectTranslations } from '@tectra/core/i18n';
import {
  TxOverlayInsets,
  TxPlacement,
  placementFromPosition,
  txAnimateEnter,
  txAnimateLeave,
  txPositions,
  txViewportMargin,
  watchOrigin,
} from '@tectra/core/overlay';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName } from '@tectra/icons';
import { TectraDeepPartial, TectraSelectTokens, toStyleObject } from '@tectra/themes';
import { TxSkeleton } from '@tectra/ui/skeleton';
import {
  TxSelectEmptyFilterTemplate,
  TxSelectEmptyTemplate,
  TxSelectFooterTemplate,
  TxSelectGroupTemplate,
  TxSelectHeaderTemplate,
  TxSelectOptionTemplate,
  TxSelectValueTemplate,
} from './select-option-template.directive';
import { buildOptionRows, foldText, isSelectableRow, sameOptionValue } from './select-options';
import {
  TxFieldVariant,
  TxFilterMatchMode,
  TxOptionFields,
  TxSelectChangeEvent,
  TxSelectFilterEvent,
  TxSelectGroupRow,
  TxSelectItem,
  TxSelectLazyLoadEvent,
  TxSelectPart,
  TxSelectRow,
  TxSelectSize,
} from './select.types';

interface TxSelectSection {
  group: TxSelectGroupRow | null;
  rows: { row: TxSelectRow; index: number }[];
}

const DEFAULT_LIST_HEIGHT = 240;

@Component({
  selector: 'tx-select',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, NgTemplateOutlet, TxIcon, TxSkeleton],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxSelect), multi: true }],
  host: {
    class: 'tx-select',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[class.tx-select--open]': 'isOpen()',
    '[class.tx-select--disabled]': 'disabled()',
    '[class.tx-select--invalid]': 'isInvalid()',
    '[class.tx-select--readonly]': 'readonly()',
    '[class.tx-select--filled]': 'hasValue()',
    '[class.tx-select--editable]': 'editable()',
  },
})
export class TxSelect extends TxFormControlBase<unknown> {
  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string>('value');
  readonly optionDisabled = input<string>('disabled');
  readonly group = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly optionGroupLabel = input<string>('label');
  readonly optionGroupChildren = input<string>('items');
  readonly dataKey = input<string | undefined>(undefined);
  readonly placeholder = input<string>('');
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly filter = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterMatchMode = input<TxFilterMatchMode>('contains');
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterDelay = input<number>(0);
  readonly resetFilterOnHide = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly editable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly checkmark = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly lazy = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly virtualScroll = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input<number>(36);
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly emptyFilterMessage = input<string | undefined>(undefined);
  readonly dropdownIcon = input<TxIconName>('chevron-down');
  readonly size = input<TxSelectSize>('medium');
  readonly variant = input<TxFieldVariant>('outlined');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraSelectTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSelectPart, TxSelect> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly changed = output<TxSelectChangeEvent>();
  readonly cleared = output<void>();
  readonly filtered = output<TxSelectFilterEvent>();
  readonly lazyLoad = output<TxSelectLazyLoadEvent>();

  readonly optionTemplate = contentChild(TxSelectOptionTemplate);
  readonly valueTemplate = contentChild(TxSelectValueTemplate);
  readonly groupTemplate = contentChild(TxSelectGroupTemplate);
  readonly headerTemplate = contentChild(TxSelectHeaderTemplate);
  readonly footerTemplate = contentChild(TxSelectFooterTemplate);
  readonly emptyTemplate = contentChild(TxSelectEmptyTemplate);
  readonly emptyFilterTemplate = contentChild(TxSelectEmptyFilterTemplate);

  readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  readonly viewport = viewChild(CdkVirtualScrollViewport);

  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  private typeahead = new TxTypeahead();
  private overlayInsets = inject(TxOverlayInsets);
  private stopWatchingTrigger: (() => void) | null = null;
  private filterTimer: ReturnType<typeof setTimeout> | null = null;
  private lastLazyRange = '';
  private hasEntered = false;
  private readonly stopOnDestroy = inject(DestroyRef).onDestroy(() => {
    this.stopWatchingTrigger?.();
    if (this.filterTimer) {
      clearTimeout(this.filterTimer);
    }
  });

  readonly translations = injectTranslations();
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('select', this, this.pt, this.ptOptions);
  readonly positions = txPositions('bottom-start', 4);
  readonly scrollStrategy = createRepositionScrollStrategy(this.injector);
  readonly viewportMargin = signal(txViewportMargin({ top: 0, bottom: 0 }, 8));
  readonly listboxId = uniqueId('tx-select-listbox');

  readonly isOpen = signal(false);
  readonly isPanelMounted = signal(false);
  readonly panelPlacement = signal<TxPlacement>('bottom-start');
  readonly query = signal('');
  readonly activeIndex = signal(-1);
  readonly panelWidth = signal(0);
  private readonly chosen = signal<TxSelectItem | null>(null);

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
  readonly rows = computed(() => (this.filter() && !this.lazy() && this.query().trim() ? this.buildRows(this.query()) : this.allRows()));
  readonly sections = computed<TxSelectSection[]>(() => {
    const sections: TxSelectSection[] = [];
    this.rows().forEach((row, index) => {
      if (row.type === 'group') {
        sections.push({ group: row, rows: [] });
      } else {
        if (!sections.length) {
          sections.push({ group: null, rows: [] });
        }
        sections[sections.length - 1].rows.push({ row, index });
      }
    });
    return sections;
  });
  readonly optionCount = computed(() => this.rows().filter((row) => row.type !== 'group').length);
  readonly selectedItem = computed<TxSelectItem | null>(() => {
    const found = this.allRows().find((row): row is TxSelectItem => row.type === 'option' && row.selected);
    const chosen = this.chosen();
    return found ?? (chosen && this.isSelected(chosen.value) ? chosen : null);
  });
  readonly hasValue = computed(() => {
    const value = this.value();
    return value !== null && value !== undefined && value !== '';
  });
  readonly editableText = computed(() => {
    const value = this.value();
    return this.selectedItem()?.label ?? (value === null || value === undefined ? '' : String(value));
  });
  readonly activeItemId = computed(() => {
    const row = this.isOpen() ? this.rows()[this.activeIndex()] : undefined;
    return row?.type === 'option' ? row.id : null;
  });
  readonly canClear = computed(() => this.showClear() && this.hasValue() && !this.disabled() && !this.readonly());
  readonly listMaxHeight = computed(() => this.scrollHeight() ?? null);
  readonly virtualHeight = computed(() => {
    const limit = parseFloat(this.scrollHeight() ?? '') || DEFAULT_LIST_HEIGHT;
    return Math.min(this.rows().length * this.virtualScrollItemSize(), limit);
  });
  readonly emptyText = computed(() =>
    this.query().trim()
      ? (this.emptyFilterMessage() ?? this.translations().emptyMessage)
      : (this.emptyMessage() ?? this.translations().emptyMessage),
  );
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-select'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly panelStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().panel?.style }));
  readonly trackRow = (index: number, row: TxSelectRow): string => row.id;

  constructor() {
    super();
    effect((onCleanup) => {
      const viewport = this.viewport();
      if (!viewport) {
        return;
      }
      const subscription = viewport.renderedRangeStream.subscribe((range) => this.requestLazy(range.start, range.end));
      onCleanup(() => subscription.unsubscribe());
    });
    afterRenderEffect(() => {
      this.virtualHeight();
      this.viewport()?.checkViewportSize();
    });
    effect(() => {
      this.rows();
      untracked(() => {
        if (this.isOpen() && !isSelectableRow(this.rows()[this.activeIndex()])) {
          this.activeIndex.set(this.rows().findIndex(isSelectableRow));
        }
      });
    });
  }

  open(): void {
    if (this.disabled() || this.readonly() || this.isOpen()) {
      return;
    }
    this.panelWidth.set(this.box().nativeElement.offsetWidth);
    const rows = this.rows();
    const selected = rows.findIndex((row) => row.type === 'option' && row.selected);
    this.activeIndex.set(selected >= 0 ? selected : rows.findIndex(isSelectableRow));
    this.isOpen.set(true);
    this.hasEntered = false;
    this.lastLazyRange = '';
    this.isPanelMounted.set(true);
    this.viewportMargin.set(txViewportMargin(this.overlayInsets.measure(), 8));
    this.stopWatchingTrigger = watchOrigin(this.box().nativeElement, this.overlayInsets, {
      hidden: () => this.close(),
      insetsChange: (insets) => this.viewportMargin.set(txViewportMargin(insets, 8)),
    });
    if (this.lazy() && !this.virtualScroll()) {
      this.requestLazy(0, this.rows().length);
    }
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.stopWatchingTrigger?.();
    this.stopWatchingTrigger = null;
    if (this.resetFilterOnHide() && this.query()) {
      this.query.set('');
      this.emitFilter();
    }
    this.markTouched();
    this.closed.emit();
    const panel = this.panel()?.nativeElement;
    (panel ? txAnimateLeave(panel, this.panelPlacement()) : Promise.resolve()).then(() => {
      if (!this.isOpen()) {
        this.isPanelMounted.set(false);
      }
    });
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  choose(item: TxSelectItem): void {
    if (item.disabled) {
      return;
    }
    this.select(item);
    this.close();
    this.focusTrigger();
  }

  clear(): void {
    this.chosen.set(null);
    this.updateValue(null);
    this.changed.emit({ value: null, option: null });
    this.cleared.emit();
    this.focusTrigger();
  }

  onBoxClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.tx-select__clear') || (this.editable() && target.closest('.tx-select__input'))) {
      return;
    }
    this.toggle();
    if (this.editable()) {
      this.focusTrigger();
    }
  }

  onPanelAttach(): void {
    this.filterInput()?.nativeElement.focus();
  }

  onPositionChange(change: ConnectedOverlayPositionChange): void {
    this.panelPlacement.set(placementFromPosition(change.connectionPair) ?? 'bottom-start');
    const panel = this.panel()?.nativeElement;
    if (!this.hasEntered && panel) {
      this.hasEntered = true;
      txAnimateEnter(panel, this.panelPlacement());
      this.scrollActiveIntoView();
    }
  }

  onPanelDetach(): void {
    this.isPanelMounted.set(false);
    this.close();
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.box().nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
      this.focusTrigger();
    }
  }

  onPanelMousedown(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('input, button, a[href], textarea, select, [tabindex]')) {
      event.preventDefault();
    }
  }

  onPanelFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !this.panel()?.nativeElement.contains(next) && !this.box().nativeElement.contains(next)) {
      this.close();
    } else if (!next) {
      queueMicrotask(() => {
        const active = this.document.activeElement;
        if (this.isOpen() && (!active || active === this.document.body)) {
          (this.filterInput()?.nativeElement ?? this.trigger()?.nativeElement)?.focus();
        }
      });
    }
  }

  onFilter(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.rows().findIndex(isSelectableRow));
    this.viewport()?.scrollToOffset(0);
    this.emitFilter();
  }

  onEditableInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    const folded = foldText(text.trim());
    const match = folded
      ? this.allRows().find((row): row is TxSelectItem => isSelectableRow(row) && foldText(row.label) === folded)
      : undefined;
    this.chosen.set(match ?? null);
    this.updateValue(match ? match.value : text || null);
    this.changed.emit({ value: this.value(), option: match?.option ?? null });
    if (!this.isOpen()) {
      this.open();
    }
    const startsWith = folded ? this.rows().findIndex((row) => isSelectableRow(row) && foldText(row.label).startsWith(folded)) : -1;
    if (startsWith >= 0) {
      this.activeIndex.set(startsWith);
      this.scrollActiveIntoView();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.readonly()) {
      return;
    }
    const target = event.target as HTMLElement;
    const typing = target.classList.contains('tx-select__filter-input') || this.editable();
    const rows = this.rows();
    const active = rows[this.activeIndex()];
    if (event.key === 'Escape') {
      if (this.isOpen()) {
        event.preventDefault();
        this.close();
        this.focusTrigger();
      }
      return;
    }
    if (event.key === 'Tab') {
      if (!(target.classList.contains('tx-select__filter-input') && !event.shiftKey && this.panelHasActions())) {
        this.close();
      }
      return;
    }
    if (event.key === 'Enter' || (event.key === ' ' && !typing)) {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
      } else if (isSelectableRow(active)) {
        this.choose(active);
      } else if (this.editable()) {
        this.close();
      }
      return;
    }
    const isListKey = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(event.key);
    if (isListKey && !(typing && (event.key === 'Home' || event.key === 'End'))) {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        return;
      }
      this.moveActive(event.key);
      return;
    }
    if (!typing && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const labels = rows.map((row) => (isSelectableRow(row) ? row.label : ''));
      const found = this.typeahead.search(event.key, labels, this.activeIndex());
      const row = found === null ? undefined : rows[found];
      if (found !== null && isSelectableRow(row)) {
        if (this.isOpen()) {
          this.activeIndex.set(found);
          this.scrollActiveIntoView();
        } else {
          this.select(row);
        }
      }
    }
  }

  private moveActive(key: string): void {
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
    }
  }

  private panelHasActions(): boolean {
    return !!this.panel()?.nativeElement.querySelector(
      ':is(.tx-select__header, .tx-select__footer, .tx-select__empty) :is(button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]))',
    );
  }

  private select(item: TxSelectItem): void {
    this.chosen.set(item);
    this.updateValue(item.value);
    this.changed.emit({ value: item.value, option: item.option });
  }

  private focusTrigger(): void {
    this.trigger()?.nativeElement.focus();
  }

  private emitFilter(): void {
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

  private requestLazy(start: number, end: number): void {
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

  private scrollActiveIntoView(): void {
    const index = this.activeIndex();
    const viewport = this.viewport();
    if (viewport) {
      const size = this.virtualScrollItemSize();
      const top = index * size;
      const offset = viewport.measureScrollOffset('top');
      const height = viewport.getViewportSize();
      if (top < offset) {
        viewport.scrollToOffset(top);
      } else if (top + size > offset + height) {
        viewport.scrollToOffset(top + size - height);
      }
      return;
    }
    const id = this.activeItemId();
    queueMicrotask(() => (id ? this.document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }) : undefined));
  }

  private isSelected(value: unknown): boolean {
    const current = this.value();
    return current !== null && current !== undefined && sameOptionValue(value, current, this.dataKey());
  }

  private buildRows(query: string): TxSelectRow[] {
    return buildOptionRows({
      options: this.options(),
      fields: this.fields(),
      group: this.group(),
      idPrefix: this.listboxId,
      query,
      filterFields: this.filterFields(),
      matchMode: this.filterMatchMode(),
      isSelected: (value) => this.isSelected(value),
    });
  }
}
