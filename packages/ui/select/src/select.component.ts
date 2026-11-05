import { CdkConnectedOverlay, CdkOverlayOrigin, createRepositionScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxTypeahead, nextListIndex, uniqueId } from '@tectra/core/a11y';
import { TxFormControlBase } from '@tectra/core/forms';
import { injectTranslations } from '@tectra/core/i18n';
import { txPositions } from '@tectra/core/overlay';
import { TxIcon } from '@tectra/icons';
import { TxSelectOptionTemplate } from './select-option-template.directive';
import { TxSelectItem, TxSelectSize } from './select.types';

@Component({
  selector: 'tx-select',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, NgTemplateOutlet, TxIcon],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxSelect), multi: true }],
  host: {
    class: 'tx-select',
    '[attr.data-size]': 'size()',
    '[class.tx-select--open]': 'isOpen()',
    '[class.tx-select--disabled]': 'disabled()',
  },
})
export class TxSelect extends TxFormControlBase<unknown> {
  options = input<object[]>([]);
  optionLabel = input<string>('label');
  optionValue = input<string>('value');
  placeholder = input<string>('');
  ariaLabel = input<string | undefined>(undefined);
  ariaLabelledBy = input<string | undefined>(undefined);
  filter = input<boolean>(false);
  size = input<TxSelectSize>('medium');

  opened = output<void>();
  closed = output<void>();

  optionTemplate = contentChild(TxSelectOptionTemplate);
  trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');

  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  private typeahead = new TxTypeahead();

  readonly translations = injectTranslations();
  readonly positions = txPositions('bottom-start', 4);
  readonly scrollStrategy = createRepositionScrollStrategy(this.injector);
  readonly listboxId = uniqueId('tx-select-listbox');

  isOpen = signal(false);
  query = signal('');
  activeIndex = signal(0);
  panelWidth = signal(0);

  items = computed<TxSelectItem[]>(() =>
    this.options().map((option, index) => {
      const value = this.optionValue() ? this.readField(option, this.optionValue()) : option;
      return {
        id: `${this.listboxId}-${index}`,
        label: String(this.readField(option, this.optionLabel()) ?? ''),
        value,
        option,
        selected: value === this.value(),
      };
    }),
  );
  visibleItems = computed(() => {
    const query = this.query().trim().toLowerCase();
    return query ? this.items().filter((item) => item.label.toLowerCase().includes(query)) : this.items();
  });
  selectedItem = computed(() => this.items().find((item) => item.selected) ?? null);
  activeItemId = computed(() => (this.isOpen() ? this.visibleItems()[this.activeIndex()]?.id ?? null : null));

  open(): void {
    if (this.disabled() || this.isOpen()) {
      return;
    }
    this.panelWidth.set(this.trigger().nativeElement.offsetWidth);
    this.query.set('');
    this.activeIndex.set(Math.max(0, this.visibleItems().findIndex((item) => item.selected)));
    this.isOpen.set(true);
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.markTouched();
    this.closed.emit();
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  choose(item: TxSelectItem): void {
    this.updateValue(item.value);
    this.close();
    this.trigger().nativeElement.focus();
  }

  onPanelAttach(): void {
    this.filterInput()?.nativeElement.focus();
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.trigger().nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  onFilter(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const fromFilter = target.classList.contains('tx-select__filter-input');
    if (event.key === 'Escape') {
      if (this.isOpen()) {
        event.preventDefault();
        this.close();
        this.trigger().nativeElement.focus();
      }
      return;
    }
    if (event.key === 'Tab') {
      this.close();
      return;
    }
    if (event.key === 'Enter' || (event.key === ' ' && !fromFilter)) {
      event.preventDefault();
      const item = this.visibleItems()[this.activeIndex()];
      if (this.isOpen() && item) {
        this.choose(item);
      } else {
        this.open();
      }
      return;
    }
    const isListKey = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(event.key);
    if (isListKey && (!fromFilter || event.key.startsWith('Arrow') || event.key.startsWith('Page'))) {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        return;
      }
      const next = nextListIndex(event.key, { count: this.visibleItems().length, current: this.activeIndex() });
      if (next !== null) {
        this.activeIndex.set(next);
        this.scrollActiveIntoView();
      }
      return;
    }
    if (!fromFilter && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const labels = this.visibleItems().map((item) => item.label);
      const found = this.typeahead.search(event.key, labels, this.activeIndex());
      if (found !== null) {
        if (this.isOpen()) {
          this.activeIndex.set(found);
          this.scrollActiveIntoView();
        } else {
          this.updateValue(this.visibleItems()[found].value);
        }
      }
    }
  }

  private scrollActiveIntoView(): void {
    const id = this.activeItemId();
    queueMicrotask(() => (id ? this.document.getElementById(id)?.scrollIntoView({ block: 'nearest' }) : undefined));
  }

  private readField(option: object, field: string): unknown {
    return (option as Record<string, unknown>)[field];
  }
}
