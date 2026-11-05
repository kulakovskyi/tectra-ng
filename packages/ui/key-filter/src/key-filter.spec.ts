import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxKeyFilter } from './key-filter.directive';
import { TX_KEY_FILTER_PRESETS, txKeyFilterAccepts, txKeyFilterRule } from './key-filter.presets';
import { TxKeyFilterPreset } from './key-filter.types';

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
  readonly filter = signal<TxKeyFilterPreset | RegExp>('pint');
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
});
