import { Directive, ElementRef, booleanAttribute, computed, effect, forwardRef, inject, input, untracked } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { txKeyFilterAccepts, txKeyFilterRule } from './key-filter.presets';
import { TxKeyFilterRule, TxKeyFilterValue } from './key-filter.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { KEY_FILTER_ICON_DEFAULTS } from './key-filter.icons';

type TextField = HTMLInputElement | HTMLTextAreaElement;

@Directive({
  selector: 'input[txKeyFilter], textarea[txKeyFilter]',
  providers: [provideTxIconDefaults(KEY_FILTER_ICON_DEFAULTS), { provide: NG_VALIDATORS, useExisting: forwardRef(() => TxKeyFilter), multi: true }],
  host: {
    '(beforeinput)': 'onBeforeInput($event)',
    '(input)': 'onInput($event)',
    '(compositionstart)': 'onCompositionStart()',
    '(compositionend)': 'onCompositionEnd()',
    '(paste)': 'onPaste($event)',
    '(drop)': 'onDrop($event)',
  },
})
export class TxKeyFilter implements Validator {
  private elementRef = inject<ElementRef<TextField>>(ElementRef);

  readonly txKeyFilter = input.required<TxKeyFilterValue>();
  readonly keyFilterExtra = input<string>('');
  readonly validateOnly = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly rule = computed<TxKeyFilterRule | null>(() => {
    const filter = this.txKeyFilter();
    return filter ? txKeyFilterRule(filter, this.keyFilterExtra()) : null;
  });
  private readonly blockingRule = computed(() => (this.validateOnly() ? null : this.rule()));

  private composing = false;
  private previous: string | null = null;
  private validatorChange: (() => void) | null = null;
  private validatorReady = false;
  private readonly revalidate = effect(() => {
    this.rule();
    this.validateOnly();
    if (this.validatorReady) {
      untracked(() => this.validatorChange?.());
    }
    this.validatorReady = true;
  });

  onBeforeInput(inputEvent: Event): void {
    const event = inputEvent as InputEvent;
    const rule = this.blockingRule();
    if (!rule) {
      return;
    }
    if (!this.composing) {
      this.previous = this.elementRef.nativeElement.value;
    }
    if (event.data === null || event.inputType.startsWith('delete') || event.inputType === 'insertFromPaste') {
      return;
    }
    if (!this.accepts(rule, event.data)) {
      event.preventDefault();
    }
  }

  onInput(event: Event): void {
    if (!this.composing && !(event as InputEvent).isComposing) {
      this.clean();
    }
  }

  onCompositionStart(): void {
    this.composing = true;
    this.previous = this.elementRef.nativeElement.value;
  }

  onCompositionEnd(): void {
    this.composing = false;
    this.clean();
  }

  onPaste(event: Event): void {
    const rule = this.blockingRule();
    if (rule) {
      this.insertFiltered(rule, event, (event as ClipboardEvent).clipboardData?.getData('text') ?? '');
    }
  }

  onDrop(event: Event): void {
    const rule = this.blockingRule();
    if (rule) {
      this.insertFiltered(rule, event, (event as DragEvent).dataTransfer?.getData('text') ?? '');
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const rule = this.rule();
    if (!this.validateOnly() || !rule) {
      return null;
    }
    const value = control.value === null || control.value === undefined ? '' : String(control.value);
    return !value || txKeyFilterAccepts(rule, value) ? null : { keyFilter: { value } };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validatorChange = fn;
  }

  private clean(): void {
    const rule = this.blockingRule();
    const previous = this.previous;
    this.previous = null;
    const element = this.elementRef.nativeElement;
    const text = element.value;
    if (!rule || txKeyFilterAccepts(rule, text)) {
      return;
    }
    const keep = (part: string) => [...part].filter((character) => rule.char.test(character)).join('');
    let next = keep(text);
    let caret = keep(text.slice(0, this.selection(element)[1])).length;
    if (rule.value && !rule.value.test(next) && previous !== null && txKeyFilterAccepts(rule, previous)) {
      next = previous;
      caret = next.length;
    }
    if (next === text) {
      return;
    }
    element.value = next;
    this.placeCaret(element, caret);
    this.notify(element);
  }

  private placeCaret(element: TextField, caret: number): void {
    try {
      element.setSelectionRange(caret, caret);
    } catch {
      return;
    }
  }

  private notify(element: TextField): void {
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private insertFiltered(rule: TxKeyFilterRule, event: Event, text: string): void {
    const filtered = [...text].filter((character) => rule.char.test(character)).join('');
    if (filtered === text && this.accepts(rule, text)) {
      return;
    }
    event.preventDefault();
    if (!filtered || !this.accepts(rule, filtered)) {
      return;
    }
    const element = this.elementRef.nativeElement;
    const [start, end] = this.selection(element);
    element.setRangeText(filtered, start, end, 'end');
    this.notify(element);
  }

  private accepts(rule: TxKeyFilterRule, text: string): boolean {
    const element = this.elementRef.nativeElement;
    const [start, end] = this.selection(element);
    const next = element.value.slice(0, start) + text + element.value.slice(end);
    return [...text].every((character) => rule.char.test(character)) && (!rule.value || rule.value.test(next));
  }

  private selection(element: TextField): [number, number] {
    try {
      return [element.selectionStart ?? element.value.length, element.selectionEnd ?? element.value.length];
    } catch {
      return [element.value.length, element.value.length];
    }
  }
}
