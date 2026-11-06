import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { TxOverlayAnchor } from '@tectra-ng/core/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChild, forwardRef, input, output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraSelectTokens, toStyleObject } from '@tectra-ng/themes';
import { TxOptionList } from './option-list.component';
import { TxSelectBase } from './select-base';
import { TxSelectValueTemplate } from './select-option-template.directive';
import { foldText, isSelectableRow } from './select-options';
import { TxSelectChangeEvent, TxSelectItem, TxSelectPart } from './select.types';

@Component({
  selector: 'tx-select',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, TxOverlayAnchor, NgTemplateOutlet, TxIcon, TxOptionList],
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
export class TxSelect extends TxSelectBase<unknown> {
  readonly options = input<readonly unknown[]>([]);
  readonly editable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly checkmark = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dropdownIcon = input<TxIconName>('chevron-down');
  readonly dt = input<TectraDeepPartial<TectraSelectTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSelectPart, TxSelect> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxSelectChangeEvent>();

  readonly valueTemplate = contentChild(TxSelectValueTemplate);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('select', this, this.pt, this.ptOptions);
  private readonly chosen = signal<TxSelectItem | null>(null);
  protected readonly source = this.options;

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
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-select'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly panelStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().panel?.style }));

  protected override get typingTarget(): boolean {
    return this.editable();
  }

  choose(item: TxSelectItem): void {
    if (item.disabled) {
      return;
    }
    this.select(item);
    this.close();
    this.focusTrigger();
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

  protected isSelected(value: unknown): boolean {
    const current = this.value();
    return current !== null && current !== undefined && this.sameValue(value, current);
  }

  protected activate(item: TxSelectItem): void {
    this.choose(item);
  }

  protected clearValue(): void {
    this.chosen.set(null);
    this.updateValue(null);
    this.changed.emit({ value: null, option: null });
  }

  protected onTypeaheadClosed(item: TxSelectItem): void {
    this.select(item);
  }

  protected handleExtraKey(): boolean {
    return false;
  }

  protected ignoreBoxClick(target: HTMLElement): boolean {
    return this.editable() && !!target.closest('.tx-select__input');
  }

  private select(item: TxSelectItem): void {
    this.chosen.set(item);
    this.updateValue(item.value);
    this.changed.emit({ value: item.value, option: item.option });
  }
}
