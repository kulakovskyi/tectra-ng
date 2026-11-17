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
  model,
  output,
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
import {
  TxChipsInputCommitEvent,
  TxChipsInputEvent,
  TxChipsInputLengthMode,
  TxChipsInputNormalizer,
  TxChipsInputPart,
  TxChipsInputRejectReason,
  TxChipsInputRejectedEvent,
  TxChipsInputSize,
  TxChipsInputVariant,
} from './chips-input.types';
import { CHIPS_INPUT_ICON_DEFAULTS } from './chips-input.icons';
import { CHIPS_INPUT_THEME } from './chips-input.theme';

/**
 * A text field that turns typed text into removable chips; the value is a list of strings. A `ControlValueAccessor` —
 * works with `[formControl]`, `ngModel`, signal forms and `[(value)]`.
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

  override readonly value = model<string[] | null>(null);
  readonly placeholder = input<string>('');
  readonly separator = input<string | RegExp>(',');
  readonly addOnBlur = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly allowDuplicate = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly caseSensitive = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly max = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);
  readonly maxLengthMode = input<TxChipsInputLengthMode>('truncate');
  readonly normalize = input<TxChipsInputNormalizer | undefined>(undefined);
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
  readonly text = model('');

  readonly added = output<TxChipsInputEvent>();
  readonly removed = output<TxChipsInputEvent>();
  readonly rejected = output<TxChipsInputRejectedEvent>();
  readonly committed = output<TxChipsInputCommitEvent>();

  readonly itemTemplate = contentChild(TxChipsInputItemTemplate);
  readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  readonly translations = injectTranslations();
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('chipsInput', this, this.pt, this.ptOptions);

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
    const field = this.field().nativeElement;
    const current = field.value;
    const start = field.selectionStart ?? current.length;
    const end = field.selectionEnd ?? current.length;
    const combined = current.slice(0, start) + pasted + current.slice(end);
    const parts = combined.split(/\r?\n/).flatMap((line) => line.split(this.separator()));
    if (parts.length > 1) {
      event.preventDefault();
      this.addAll(parts);
      this.setText('');
      return;
    }
    const value = this.prepare(combined);
    if (value !== null && this.rejectReason(value, this.values()) === 'length') {
      event.preventDefault();
      this.addAll([combined]);
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
        this.setText('');
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
      this.setText('');
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

  add(value: string | readonly string[]): void {
    if (this.disabled() || this.readonly()) {
      return;
    }
    this.addAll(typeof value === 'string' ? [value] : [...value]);
  }

  clearText(): void {
    this.setText('');
  }

  private addAll(parts: readonly string[]): void {
    let values = this.values();
    const added: TxChipsInputEvent[] = [];
    const refused: { value: string; reason: TxChipsInputRejectReason }[] = [];
    for (const part of parts) {
      const value = this.prepare(part);
      if (value === null) {
        continue;
      }
      const reason = this.rejectReason(value, values);
      if (reason) {
        refused.push({ value, reason });
        continue;
      }
      values = [...values, value];
      added.push({ value, values });
    }
    if (added.length) {
      this.updateValue(values);
    }
    const rejected = refused.map((item): TxChipsInputRejectedEvent => ({ ...item, values }));
    added.forEach((event) => this.added.emit(event));
    rejected.forEach((event) => this.rejected.emit(event));
    if (added.length || rejected.length) {
      this.committed.emit({ added: added.map((event) => event.value), rejected, values });
    }
  }

  private prepare(part: string): string | null {
    const trimmed = part.trim();
    const normalize = this.normalize();
    const value = trimmed && normalize ? normalize(trimmed)?.trim() : trimmed;
    if (!value) {
      return null;
    }
    const maxLength = this.maxLength();
    return maxLength && this.maxLengthMode() === 'truncate' ? value.slice(0, maxLength).trimEnd() : value;
  }

  private rejectReason(value: string, values: readonly string[]): TxChipsInputRejectReason | null {
    const maxLength = this.maxLength();
    if (maxLength && value.length > maxLength) {
      return 'length';
    }
    const pattern = this.itemPattern();
    if (pattern && !pattern.test(value)) {
      return 'pattern';
    }
    const caseSensitive = this.caseSensitive();
    if (!this.allowDuplicate() && values.some((item) => (caseSensitive ? item === value : item.toLowerCase() === value.toLowerCase()))) {
      return 'duplicate';
    }
    const max = this.max();
    return max !== undefined && values.length >= max ? 'max' : null;
  }

  private setText(text: string): void {
    this.text.set(text);
    this.field().nativeElement.value = text;
  }
}
