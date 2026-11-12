import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraInputOtpTokens, toStyleObject } from '@tectra-ng/themes';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputOtpPart, TxInputOtpSize, TxInputOtpVariant } from './input-otp.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { INPUT_OTP_ICON_DEFAULTS } from './input-otp.icons';
import { INPUT_OTP_THEME } from './input-otp.theme';

@Component({
  selector: 'tx-input-otp',
  imports: [TxInput],
  templateUrl: './input-otp.component.html',
  styleUrl: './input-otp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxInputOtp), multi: true }],
  host: {
    class: 'tx-input-otp',
    role: 'group',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[class.tx-input-otp--invalid]': 'isInvalid()',
    '[class.tx-input-otp--filled]': 'isComplete()',
  },
  viewProviders: [provideTxIconDefaults(INPUT_OTP_ICON_DEFAULTS)],
})
export class TxInputOtp extends TxFormControlBase<string> {
  private readonly inputOtpTheme = injectTokens(INPUT_OTP_THEME);

  private generatedId = uniqueId('tx-input-otp');

  readonly length = input<number, unknown>(6, { transform: numberAttribute });
  readonly integerOnly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly mask = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly groupSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly autoFocus = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly size = input<TxInputOtpSize>('medium');
  readonly variant = input<TxInputOtpVariant>('outlined');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraInputOtpTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxInputOtpPart, TxInputOtp> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly completed = output<string>();

  readonly cells = viewChildren<ElementRef<HTMLInputElement>>('cell');

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('inputOtp', this, this.pt, this.ptOptions);
  readonly isInvalid = injectFieldInvalid(this.invalid);

  readonly chars = signal<string[]>([]);
  readonly indexes = computed(() => Array.from({ length: Math.max(1, this.length()) }, (_, index) => index));
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly isComplete = computed(() => this.indexes().every((index) => !!this.chars()[index]));
  readonly firstId = computed(() => this.inputId() ?? this.generatedId);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-input-otp'), ...this.passThrough().root?.style }));

  constructor() {
    super();
    afterNextRender(() => {
      if (this.autoFocus()) {
        this.focusCell(0);
      }
    });
  }

  override writeValue(value: string | null): void {
    super.writeValue(value);
    this.chars.set(Array.from(this.clean(value ?? '')).slice(0, this.length()));
  }

  hasSeparator(index: number): boolean {
    const size = this.groupSize();
    return !!size && index > 0 && index % size === 0;
  }

  cellLabel(index: number): string {
    return this.translations().otpCell.replace('{index}', String(index + 1)).replace('{length}', String(this.length()));
  }

  focus(): void {
    this.focusCell(Math.min(this.chars().filter(Boolean).length, this.length() - 1));
  }

  onInput(event: Event, index: number): void {
    const element = event.target as HTMLInputElement;
    const typed = this.clean(element.value);
    if (!typed) {
      element.value = this.chars()[index] ?? '';
      if (!element.value) {
        this.setChars(index, ['']);
      }
      return;
    }
    const incoming = typed.length > 1 && this.chars()[index] && typed.startsWith(this.chars()[index]) ? typed.slice(1) : typed;
    this.fillFrom(index, incoming);
  }

  onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const text = this.clean(event.clipboardData?.getData('text') ?? '');
    if (text) {
      this.fillFrom(index, text);
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const last = this.length() - 1;
    switch (event.key) {
      case 'Backspace':
        if (!this.chars()[index] && index > 0) {
          event.preventDefault();
          this.setChars(index - 1, ['']);
          this.focusCell(index - 1);
        }
        break;
      case 'Delete':
        event.preventDefault();
        this.setChars(index, ['']);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusCell(Math.max(0, index - 1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusCell(Math.min(last, index + 1));
        break;
      case 'Home':
        event.preventDefault();
        this.focusCell(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusCell(last);
        break;
    }
  }

  onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  onBlur(): void {
    this.markTouched();
  }

  private fillFrom(index: number, text: string): void {
    const chars = Array.from(text).slice(0, this.length() - index);
    this.setChars(index, chars);
    this.focusCell(Math.min(index + chars.length, this.length() - 1));
  }

  private setChars(index: number, values: string[]): void {
    const next = this.indexes().map((position) => this.chars()[position] ?? '');
    values.forEach((value, offset) => (next[index + offset] = value));
    this.chars.set(next);
    this.syncCells();
    const value = next.join('');
    this.updateValue(value);
    if (this.isComplete()) {
      this.completed.emit(value);
    }
  }

  private syncCells(): void {
    this.cells().forEach((cell, position) => (cell.nativeElement.value = this.chars()[position] ?? ''));
  }

  private focusCell(index: number): void {
    const cell = this.cells()[index]?.nativeElement;
    cell?.focus();
    cell?.select();
  }

  private clean(text: string): string {
    const compact = text.replace(/\s/g, '');
    return this.integerOnly() ? compact.replace(/\D/g, '') : compact;
  }
}
