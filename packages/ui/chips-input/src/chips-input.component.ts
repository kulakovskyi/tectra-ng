import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraChipsInputTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxChip } from '@tectra-ng/ui/chip';
import { TxChipsInputItemTemplate } from './chips-input-item.directive';
import { TxChipsInputEvent, TxChipsInputPart, TxChipsInputSize, TxChipsInputVariant } from './chips-input.types';
import { CHIPS_INPUT_ICON_DEFAULTS } from './chips-input.icons';
import { CHIPS_INPUT_THEME } from './chips-input.theme';

/**
 * A text field that turns typed text into removable chips; works with forms and a list of strings as the value.
 */
@Component({
  selector: 'tx-chips-input',
  imports: [NgTemplateOutlet, TxChip, TxIcon],
  templateUrl: './chips-input.component.html',
  styleUrl: './chips-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxChipsInput), multi: true }],
  host: {
    class: 'tx-chips-input',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[class.tx-chips-input--disabled]': 'disabled()',
    '[class.tx-chips-input--invalid]': 'isInvalid()',
    '[class.tx-chips-input--readonly]': 'readonly()',
    '[class.tx-chips-input--filled]': 'values().length > 0 || !!text()',
    '[class.tx-chips-input--full]': 'isFull()',
    '(click)': 'onHostClick($event)',
  },
  viewProviders: [provideTxIconDefaults(CHIPS_INPUT_ICON_DEFAULTS)],
})
export class TxChipsInput extends TxFormControlBase<string[]> {
  private readonly chipsInputTheme = injectTokens(CHIPS_INPUT_THEME);

  readonly placeholder = input<string>('');
  readonly separator = input<string | RegExp>(',');
  readonly addOnBlur = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly allowDuplicate = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly caseSensitive = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly max = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);
  readonly itemPattern = input<RegExp | undefined>(undefined);
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly size = input<TxChipsInputSize>('medium');
  readonly variant = input<TxChipsInputVariant>('outlined');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraChipsInputTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxChipsInputPart, TxChipsInput> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly added = output<TxChipsInputEvent>();
  readonly removed = output<TxChipsInputEvent>();
  readonly rejected = output<TxChipsInputEvent>();

  readonly itemTemplate = contentChild(TxChipsInputItemTemplate);
  readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  readonly translations = injectTranslations();
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('chipsInput', this, this.pt, this.ptOptions);
  readonly text = signal('');

  readonly values = computed(() => this.value() ?? []);
  readonly isFull = computed(() => {
    const max = this.max();
    return max !== undefined && this.values().length >= max;
  });
  readonly canClear = computed(() => this.showClear() && this.values().length > 0 && !this.disabled() && !this.readonly());
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-chips-input'), ...this.passThrough().root?.style }));

  override writeValue(value: string[] | null): void {
    super.writeValue(Array.isArray(value) ? value : []);
  }

  removeLabel(item: string): string {
    return this.translations().removeItem.replace('{item}', item);
  }

  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    const separator = this.separator();
    const parts = text.split(separator);
    if (parts.length > 1) {
      this.addAll(parts.slice(0, -1));
      this.setText(parts[parts.length - 1]);
    } else {
      this.text.set(text);
    }
  }

  onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    const parts = pasted.split(/\r?\n/).flatMap((line) => line.split(this.separator()));
    if (parts.length > 1) {
      event.preventDefault();
      this.addAll(parts);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.readonly()) {
      return;
    }
    if (event.key === 'Enter') {
      if (this.text().trim()) {
        event.preventDefault();
        this.addAll([this.text()]);
      }
      return;
    }
    if (event.key === 'Backspace' && !this.text() && this.values().length) {
      event.preventDefault();
      this.removeAt(this.values().length - 1);
    }
  }

  onBlur(): void {
    if (this.addOnBlur() && this.text().trim()) {
      this.addAll([this.text()]);
    }
    this.markTouched();
  }

  onHostClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('button')) {
      this.field().nativeElement.focus();
    }
  }

  removeAt(index: number): void {
    if (this.disabled() || this.readonly()) {
      return;
    }
    const value = this.values()[index];
    const values = this.values().filter((_, position) => position !== index);
    this.updateValue(values);
    this.removed.emit({ value, values });
    this.field().nativeElement.focus();
  }

  clear(): void {
    this.updateValue([]);
    this.setText('');
    this.field().nativeElement.focus();
  }

  private addAll(parts: string[]): void {
    let values = this.values();
    for (const part of parts.map((item) => item.trim()).filter(Boolean)) {
      const value = this.maxLength() ? part.slice(0, this.maxLength()) : part;
      const duplicate = values.some((item) => (this.caseSensitive() ? item === value : item.toLowerCase() === value.toLowerCase()));
      const max = this.max();
      const full = max !== undefined && values.length >= max;
      const invalidPattern = !!this.itemPattern() && !this.itemPattern()?.test(value);
      if ((duplicate && !this.allowDuplicate()) || full || invalidPattern) {
        this.rejected.emit({ value, values });
        continue;
      }
      values = [...values, value];
      this.updateValue(values);
      this.added.emit({ value, values });
    }
    this.setText('');
  }

  private setText(text: string): void {
    this.text.set(text);
    this.field().nativeElement.value = text;
  }
}
