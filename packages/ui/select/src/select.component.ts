import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedOverlayPositionChange, createRepositionScrollStrategy } from '@angular/cdk/overlay';
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
import { TxPlacement, placementFromPosition, txAnimateEnter, txAnimateLeave, txPositions } from '@tectra/core/overlay';
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
  readonly options = input<object[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string>('value');
  readonly placeholder = input<string>('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly filter = input<boolean>(false);
  readonly size = input<TxSelectSize>('medium');

  opened = output<void>();
  closed = output<void>();

  readonly optionTemplate = contentChild(TxSelectOptionTemplate);
  readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  private typeahead = new TxTypeahead();

  readonly translations = injectTranslations();
  readonly positions = txPositions('bottom-start', 4);
  readonly scrollStrategy = createRepositionScrollStrategy(this.injector);
  readonly listboxId = uniqueId('tx-select-listbox');

  readonly isOpen = signal(false);
  readonly isPanelMounted = signal(false);
  readonly panelPlacement = signal<TxPlacement>('bottom-start');
  private hasEntered = false;
  readonly query = signal('');
  readonly activeIndex = signal(0);
  readonly panelWidth = signal(0);

  readonly items = computed<TxSelectItem[]>(() =>
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
  readonly visibleItems = computed(() => {
    const query = this.query().trim().toLowerCase();
    return query ? this.items().filter((item) => item.label.toLowerCase().includes(query)) : this.items();
  });
  readonly selectedItem = computed(() => this.items().find((item) => item.selected) ?? null);
  readonly activeItemId = computed(() => (this.isOpen() ? this.visibleItems()[this.activeIndex()]?.id ?? null : null));

  open(): void {
    if (this.disabled() || this.isOpen()) {
      return;
    }
    this.panelWidth.set(this.trigger().nativeElement.offsetWidth);
    this.query.set('');
    this.activeIndex.set(Math.max(0, this.visibleItems().findIndex((item) => item.selected)));
    this.isOpen.set(true);
    this.hasEntered = false;
    this.isPanelMounted.set(true);
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
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
    this.updateValue(item.value);
    this.close();
    this.trigger().nativeElement.focus();
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
    }
  }

  onPanelDetach(): void {
    this.isPanelMounted.set(false);
    this.close();
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
    queueMicrotask(() => (id ? this.document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }) : undefined));
  }

  private readField(option: object, field: string): unknown {
    return (option as Record<string, unknown>)[field];
  }
}
