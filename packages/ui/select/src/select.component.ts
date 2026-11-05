import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  contentChild,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra/core/a11y';
import { TxFormControlBase } from '@tectra/core/forms';
import { injectTranslations } from '@tectra/core/i18n';
import { TX_DROPDOWN_POSITIONS } from '@tectra/core/overlay';
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
  filter = input<boolean>(false);
  size = input<TxSelectSize>('medium');

  opened = output<void>();
  closed = output<void>();

  optionTemplate = contentChild(TxSelectOptionTemplate);
  trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');

  readonly translations = injectTranslations();
  readonly positions = TX_DROPDOWN_POSITIONS;
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
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.isOpen()) {
          this.moveActive(1);
        } else {
          this.open();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.moveActive(-1);
        } else {
          this.open();
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const item = this.visibleItems()[this.activeIndex()];
        if (this.isOpen() && item) {
          this.choose(item);
        } else {
          this.open();
        }
        break;
      }
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
          this.trigger().nativeElement.focus();
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  private moveActive(step: number): void {
    const count = this.visibleItems().length;
    if (count) {
      this.activeIndex.update((index) => (index + step + count) % count);
    }
  }

  private readField(option: object, field: string): unknown {
    return (option as Record<string, unknown>)[field];
  }
}
