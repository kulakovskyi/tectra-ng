import { Directive, ElementRef, booleanAttribute, computed, forwardRef, inject, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { txKeyFilterAccepts, txKeyFilterRule } from './key-filter.presets';
import { TxKeyFilterPreset } from './key-filter.types';

@Directive({
  selector: 'input[txKeyFilter], textarea[txKeyFilter]',
  providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => TxKeyFilter), multi: true }],
  host: {
    '(beforeinput)': 'onBeforeInput($event)',
    '(paste)': 'onPaste($event)',
    '(drop)': 'onDrop($event)',
  },
})
export class TxKeyFilter implements Validator {
  private elementRef = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

  readonly txKeyFilter = input.required<TxKeyFilterPreset | RegExp>();
  readonly keyFilterExtra = input<string>('');
  readonly validateOnly = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly rule = computed(() => txKeyFilterRule(this.txKeyFilter(), this.keyFilterExtra()));

  onBeforeInput(inputEvent: Event): void {
    const event = inputEvent as InputEvent;
    if (this.validateOnly() || event.data === null || event.inputType.startsWith('delete') || event.inputType === 'insertFromPaste') {
      return;
    }
    if (!this.accepts(event.data)) {
      event.preventDefault();
    }
  }

  onPaste(event: Event): void {
    if (this.validateOnly()) {
      return;
    }
    this.insertFiltered(event, (event as ClipboardEvent).clipboardData?.getData('text') ?? '');
  }

  onDrop(event: Event): void {
    if (this.validateOnly()) {
      return;
    }
    this.insertFiltered(event, (event as DragEvent).dataTransfer?.getData('text') ?? '');
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.validateOnly()) {
      return null;
    }
    const value = control.value === null || control.value === undefined ? '' : String(control.value);
    return !value || txKeyFilterAccepts(this.rule(), value) ? null : { keyFilter: { value } };
  }

  private insertFiltered(event: Event, text: string): void {
    const rule = this.rule();
    const filtered = [...text].filter((character) => rule.char.test(character)).join('');
    if (filtered === text && this.accepts(text)) {
      return;
    }
    event.preventDefault();
    if (!filtered || !this.accepts(filtered)) {
      return;
    }
    const element = this.elementRef.nativeElement;
    const start = this.selection(element)[0];
    element.setRangeText(filtered, start, this.selection(element)[1], 'end');
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private accepts(text: string): boolean {
    const element = this.elementRef.nativeElement;
    const [start, end] = this.selection(element);
    const next = element.value.slice(0, start) + text + element.value.slice(end);
    const rule = this.rule();
    return [...text].every((character) => rule.char.test(character)) && (!rule.value || rule.value.test(next));
  }

  private selection(element: HTMLInputElement | HTMLTextAreaElement): [number, number] {
    try {
      return [element.selectionStart ?? element.value.length, element.selectionEnd ?? element.value.length];
    } catch {
      return [element.value.length, element.value.length];
    }
  }
}
