import { Directive, ElementRef, booleanAttribute, computed, effect, forwardRef, inject, input, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  TxMaskEdit,
  TxMaskValues,
  deleteBackward,
  deleteForward,
  emptyValues,
  fromText,
  insert,
  isComplete,
  lastFilled,
  nextSlot,
  parseMask,
  remove,
  render,
  renderFilled,
  unmaskedValue,
} from './mask-engine';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { INPUT_MASK_ICON_DEFAULTS } from './input-mask.icons';

@Directive({
  selector: 'input[txInputMask]',
  providers: [provideTxIconDefaults(INPUT_MASK_ICON_DEFAULTS), { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxInputMask), multi: true }],
  host: {
    class: 'tx-input-mask',
    '[attr.data-mask]': 'mask()',
    '(beforeinput)': 'onBeforeInput($event)',
    '(input)': 'onInput()',
    '(focus)': 'onFocus()',
    '(click)': 'onClick()',
    '(blur)': 'onBlur()',
  },
})
export class TxInputMask implements ControlValueAccessor {
  private element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private values: TxMaskValues = [];
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private lastEmitted: string | null = null;

  readonly mask = input.required<string>({ alias: 'txInputMask' });
  readonly slotChar = input<string>('_');
  readonly autoClear = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly unmask = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly characterPattern = input<string>('[A-Za-z]');

  readonly completed = output<string>();

  readonly slots = computed(() => parseMask(this.mask(), this.characterPattern()));

  constructor() {
    effect(() => {
      const slots = this.slots();
      this.values = this.values.length === slots.length ? this.values : emptyValues(slots);
      this.paint(this.element === this.element.ownerDocument.activeElement);
    });
  }

  writeValue(value: string | null): void {
    this.values = value ? fromText(this.slots(), String(value), this.unmask()) : emptyValues(this.slots());
    this.lastEmitted = this.modelValue();
    this.paint(this.element === this.element.ownerDocument.activeElement);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.disabled = isDisabled;
  }

  onBeforeInput(event: InputEvent): void {
    if (this.element.readOnly) {
      return;
    }
    const slots = this.slots();
    const selectionStart = this.element.selectionStart ?? 0;
    const end = this.element.selectionEnd ?? selectionStart;
    const start = selectionStart === end ? Math.min(selectionStart, this.firstEmpty()) : selectionStart;
    let edit: TxMaskEdit | null = null;
    switch (event.inputType) {
      case 'insertText':
      case 'insertFromPaste':
      case 'insertFromDrop':
      case 'insertReplacementText': {
        const text = event.data ?? event.dataTransfer?.getData('text') ?? '';
        edit = insert(slots, this.values, start, end, text);
        break;
      }
      case 'deleteContentBackward':
      case 'deleteWordBackward':
        edit = start !== end ? { values: remove(slots, this.values, start, end), caret: start } : deleteBackward(slots, this.values, start);
        break;
      case 'deleteContentForward':
      case 'deleteWordForward':
        edit = start !== end ? { values: remove(slots, this.values, start, end), caret: start } : deleteForward(slots, this.values, start);
        break;
      case 'deleteByCut':
        edit = { values: remove(slots, this.values, start, end), caret: start };
        break;
      default:
        return;
    }
    event.preventDefault();
    this.apply(edit);
  }

  onInput(): void {
    this.values = fromText(this.slots(), this.element.value, false);
    this.paint(true);
    this.caret(nextSlot(this.slots(), lastFilled(this.slots(), this.values) + 1));
    this.emit();
  }

  onFocus(): void {
    this.paint(true);
    queueMicrotask(() => this.caret(this.firstEmpty()));
  }

  onClick(): void {
    const start = this.element.selectionStart ?? 0;
    if (start === this.element.selectionEnd && start > this.firstEmpty()) {
      this.caret(this.firstEmpty());
    }
  }

  onBlur(): void {
    if (this.autoClear() && !isComplete(this.slots(), this.values)) {
      this.values = emptyValues(this.slots());
      this.emit();
    }
    this.paint(false);
    this.onTouched();
  }

  private firstEmpty(): number {
    const slots = this.slots();
    return nextSlot(slots, lastFilled(slots, this.values) + 1);
  }

  private apply(edit: TxMaskEdit): void {
    this.values = edit.values;
    this.paint(true);
    this.caret(edit.caret);
    this.emit();
  }

  private paint(focused: boolean): void {
    const slots = this.slots();
    const empty = lastFilled(slots, this.values) < 0;
    this.element.value = focused ? render(slots, this.values, this.slotChar()) : empty ? '' : renderFilled(slots, this.values, this.slotChar());
  }


  private modelValue(): string {
    const slots = this.slots();
    if (lastFilled(slots, this.values) < 0) {
      return '';
    }
    return this.unmask() ? unmaskedValue(slots, this.values) : renderFilled(slots, this.values, this.slotChar());
  }

  private emit(): void {
    const value = this.modelValue();
    if (value !== this.lastEmitted) {
      this.lastEmitted = value;
      this.onChange(value);
      if (isComplete(this.slots(), this.values)) {
        this.completed.emit(value);
      }
    }
  }

  private caret(position: number): void {
    if (this.element === this.element.ownerDocument.activeElement) {
      this.element.setSelectionRange(position, position);
    }
  }
}
