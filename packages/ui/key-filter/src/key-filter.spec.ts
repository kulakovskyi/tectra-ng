import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxKeyFilter } from './key-filter.directive';
import { TX_KEY_FILTER_PRESETS, txKeyFilterAccepts, txKeyFilterRule } from './key-filter.presets';
import { TxKeyFilterValue } from './key-filter.types';

describe('key filter presets', () => {
  it('accepts and rejects by preset', () => {
    expect(txKeyFilterAccepts(TX_KEY_FILTER_PRESETS.pint, '123')).toBe(true);
    expect(txKeyFilterAccepts(TX_KEY_FILTER_PRESETS.pint, '-1')).toBe(false);
    expect(txKeyFilterAccepts(TX_KEY_FILTER_PRESETS.hex, 'Ff09')).toBe(true);
    expect(txKeyFilterAccepts(TX_KEY_FILTER_PRESETS.email, 'a.b@c')).toBe(true);
    expect(txKeyFilterAccepts(TX_KEY_FILTER_PRESETS.nospace, 'a b')).toBe(false);
  });

  it('allows one decimal separator for positive', () => {
    expect(txKeyFilterAccepts(TX_KEY_FILTER_PRESETS.positive, '12,5')).toBe(true);
    expect(txKeyFilterAccepts(TX_KEY_FILTER_PRESETS.positive, '1.2.3')).toBe(false);
  });

  it('adds extra characters to latin', () => {
    const rule = txKeyFilterRule('latin', '-_');
    expect(txKeyFilterAccepts(rule, 'a-b_C')).toBe(true);
    expect(txKeyFilterAccepts(rule, 'ab1')).toBe(false);
    expect(txKeyFilterAccepts(rule, 'привіт')).toBe(false);
  });
});

@Component({
  imports: [TxKeyFilter, ReactiveFormsModule],
  template: `<input [txKeyFilter]="filter()" [validateOnly]="validateOnly()" [formControl]="control" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly filter = signal<TxKeyFilterValue>('pint');
  readonly validateOnly = signal(false);
  readonly control = new FormControl('');
}

describe('TxKeyFilter', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, input: fixture.nativeElement.querySelector('input') as HTMLInputElement };
  }

  function type(input: HTMLInputElement, data: string): boolean {
    const event = new InputEvent('beforeinput', { data, inputType: 'insertText', cancelable: true });
    return input.dispatchEvent(event);
  }

  it('blocks characters outside the filter', () => {
    const { input } = setup();
    expect(type(input, '5')).toBe(true);
    expect(type(input, 'a')).toBe(false);
  });

  it('cleans pasted text', () => {
    const { fixture, input } = setup();
    const paste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => 'a1b2c3' } });
    input.dispatchEvent(paste);
    expect(paste.defaultPrevented).toBe(true);
    expect(input.value).toBe('123');
    expect(fixture.componentInstance.control.value).toBe('123');
  });

  it('reports an error instead of blocking with validateOnly', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.validateOnly.set(true);
    fixture.detectChanges();
    expect(type(input, 'a')).toBe(true);
    fixture.componentInstance.control.setValue('12a');
    expect(fixture.componentInstance.control.errors).toEqual({ keyFilter: { value: '12a' } });
    fixture.componentInstance.control.setValue('12');
    expect(fixture.componentInstance.control.errors).toBeNull();
  });

  it('lets deletions, line breaks and paste insertions through', () => {
    const { input } = setup();
    expect(input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', data: 'a', cancelable: true }))).toBe(true);
    expect(input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertLineBreak', cancelable: true }))).toBe(true);
    expect(input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertFromPaste', data: 'a', cancelable: true }))).toBe(true);
  });

  it('blocks a character that breaks the whole value', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.filter.set('positive');
    fixture.detectChanges();
    input.value = '1.5';
    input.setSelectionRange(3, 3);
    expect(type(input, '.')).toBe(false);
    expect(type(input, '0')).toBe(true);
  });

  it('keeps a clean paste, drops a paste with nothing allowed and one that breaks the value', () => {
    const { fixture, input } = setup();
    const paste = (text: string | null) => {
      const event = new Event('paste', { cancelable: true }) as ClipboardEvent;
      Object.defineProperty(event, 'clipboardData', { value: text === null ? null : { getData: () => text } });
      input.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(paste('42')).toBe(false);
    expect(paste(null)).toBe(false);
    expect(paste('abc')).toBe(true);
    expect(input.value).toBe('');
    fixture.componentInstance.filter.set('positive');
    fixture.detectChanges();
    expect(paste('1.2.3x')).toBe(true);
    expect(input.value).toBe('');
  });

  it('cleans dropped text and ignores a drop without data', () => {
    const { input } = setup();
    const drop = (text: string | null) => {
      const event = new Event('drop', { cancelable: true }) as DragEvent;
      Object.defineProperty(event, 'dataTransfer', { value: text === null ? null : { getData: () => text } });
      input.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(drop('x7y')).toBe(true);
    expect(input.value).toBe('7');
    expect(drop(null)).toBe(false);
  });

  it('neither cleans pastes and drops nor fails an empty value with validateOnly', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.validateOnly.set(true);
    fixture.detectChanges();
    const paste = new Event('paste', { cancelable: true });
    const drop = new Event('drop', { cancelable: true });
    input.dispatchEvent(paste);
    input.dispatchEvent(drop);
    expect(paste.defaultPrevented).toBe(false);
    expect(drop.defaultPrevented).toBe(false);
    fixture.componentInstance.control.setValue(null);
    expect(fixture.componentInstance.control.errors).toBeNull();
  });

  it('appends at the end when the input has no readable selection', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.filter.set(/[a-z]/);
    fixture.detectChanges();
    input.value = 'ab';
    Object.defineProperty(input, 'selectionStart', { get: () => null, configurable: true });
    Object.defineProperty(input, 'selectionEnd', { get: () => null, configurable: true });
    expect(type(input, 'c')).toBe(true);
    Object.defineProperty(input, 'selectionStart', {
      get: () => {
        throw new DOMException('No selection', 'InvalidStateError');
      },
    });
    expect(type(input, '1')).toBe(false);
  });

  it('switches off with null, false, undefined or an empty string', () => {
    const { fixture, input } = setup();
    for (const off of [null, false, undefined, ''] as const) {
      fixture.componentInstance.filter.set(off);
      fixture.componentInstance.validateOnly.set(false);
      fixture.detectChanges();
      expect(type(input, 'a')).toBe(true);
      const paste = new Event('paste', { cancelable: true }) as ClipboardEvent;
      Object.defineProperty(paste, 'clipboardData', { value: { getData: () => 'a1' } });
      input.dispatchEvent(paste);
      expect(paste.defaultPrevented).toBe(false);
      const drop = new Event('drop', { cancelable: true }) as DragEvent;
      Object.defineProperty(drop, 'dataTransfer', { value: { getData: () => 'a1' } });
      input.dispatchEvent(drop);
      expect(drop.defaultPrevented).toBe(false);
      input.value = 'x1';
      input.dispatchEvent(new Event('input'));
      expect(input.value).toBe('x1');
      fixture.componentInstance.validateOnly.set(true);
      fixture.detectChanges();
      fixture.componentInstance.control.setValue('12a');
      expect(fixture.componentInstance.control.errors).toBeNull();
    }
  });

  it('checks the value again when the filter changes', () => {
    const { fixture } = setup();
    fixture.componentInstance.validateOnly.set(true);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue('12a');
    expect(fixture.componentInstance.control.errors).toEqual({ keyFilter: { value: '12a' } });
    fixture.componentInstance.filter.set(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.control.errors).toBeNull();
    fixture.componentInstance.filter.set('alphanum');
    fixture.detectChanges();
    expect(fixture.componentInstance.control.errors).toBeNull();
    fixture.componentInstance.filter.set('pint');
    fixture.detectChanges();
    expect(fixture.componentInstance.control.errors).toEqual({ keyFilter: { value: '12a' } });
  });

  it('cleans text that arrives without a cancelable beforeinput', () => {
    const { fixture, input } = setup();
    input.dispatchEvent(new InputEvent('beforeinput', { data: null, inputType: 'insertReplacementText', cancelable: true }));
    input.value = '1a2b3';
    input.setSelectionRange(4, 4);
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertReplacementText' }));
    expect(input.value).toBe('123');
    expect(input.selectionStart).toBe(2);
    expect(fixture.componentInstance.control.value).toBe('123');
    input.value = '45';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('45');
  });

  it('waits for the end of a composition before cleaning', () => {
    const { fixture, input } = setup();
    input.value = '1';
    input.dispatchEvent(new CompositionEvent('compositionstart'));
    input.dispatchEvent(new InputEvent('beforeinput', { data: 'к', inputType: 'insertCompositionText' }));
    input.value = '1к';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertCompositionText', isComposing: true }));
    expect(input.value).toBe('1к');
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertCompositionText' }));
    expect(input.value).toBe('1к');
    input.dispatchEvent(new CompositionEvent('compositionend'));
    expect(input.value).toBe('1');
    expect(fixture.componentInstance.control.value).toBe('1');
  });

  it('restores the text before an input that breaks the whole value', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.filter.set('positive');
    fixture.detectChanges();
    input.value = '1.5';
    input.dispatchEvent(new InputEvent('beforeinput', { data: null, inputType: 'insertReplacementText' }));
    input.value = '1.5.2x';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('1.5');
    expect(input.selectionStart).toBe(3);
    expect(fixture.componentInstance.control.value).toBe('1.5');
    input.value = '7,7,7';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('7,7,7');
  });

  it('cleans an autofilled field whose caret cannot be set', () => {
    const { fixture, input } = setup();
    Object.defineProperty(input, 'setSelectionRange', {
      value: () => {
        throw new DOMException('No selection', 'InvalidStateError');
      },
    });
    input.value = 'n0 7';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('07');
    expect(fixture.componentInstance.control.value).toBe('07');
  });

  it('leaves the field alone with validateOnly', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.validateOnly.set(true);
    fixture.detectChanges();
    input.dispatchEvent(new InputEvent('beforeinput', { data: 'a', inputType: 'insertText' }));
    input.value = 'a1';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new CompositionEvent('compositionend'));
    expect(input.value).toBe('a1');
  });
});
