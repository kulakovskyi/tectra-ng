import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxInputNumber } from './input-number.component';
import { TxInputNumberButtonLayout } from './input-number.types';

@Component({
  imports: [TxInputNumber, ReactiveFormsModule],
  template: `
    <tx-input-number
      id="amount"
      ariaLabel="Amount"
      [formControl]="amount"
      [min]="0"
      [max]="1000"
      [step]="step()"
      [showButtons]="true"
      [buttonLayout]="layout()"
      [showClear]="true"
      [allowEmpty]="allowEmpty()"
      [dt]="{ button: { width: '40px' } }"
      [pt]="{ input: { class: 'own-input' } }"
    />
    <tx-input-number id="price" ariaLabel="Price" mode="currency" currency="USD" [formControl]="price" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly amount = new FormControl<number | null>(null);
  readonly price = new FormControl<number | null>(1234.5);
  readonly step = signal(1);
  readonly layout = signal<TxInputNumberButtonLayout>('stacked');
  readonly allowEmpty = signal(true);
}

describe('TxInputNumber', () => {
  let fixture: ComponentFixture<Host>;
  const input = (id = 'amount') => fixture.nativeElement.querySelector(`#${id} input`) as HTMLInputElement;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const type = async (value: string, id = 'amount') => {
    const element = input(id);
    element.focus();
    element.dispatchEvent(new Event('focus'));
    element.value = value;
    element.setSelectionRange(value.length, value.length);
    element.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const key = async (name: string) => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: name, cancelable: true }));
    await fixture.whenStable();
  };
  const blur = async (id = 'amount') => {
    input(id).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
  });

  it('is a spinbutton with its limits and formats the written value', () => {
    expect(input().getAttribute('role')).toBe('spinbutton');
    expect(input().getAttribute('aria-valuemin')).toBe('0');
    expect(input().getAttribute('aria-valuemax')).toBe('1000');
    expect(input('price').value).toBe('$1,234.50');
    expect(input().classList).toContain('own-input');
    expect(el('#amount').style.getPropertyValue('--tx-input-number-button-width')).toBe('40px');
  });

  it('groups digits while typing and writes a number', async () => {
    await type('12345.6', 'price');
    expect(input('price').value).toBe('$12,345.6');
    expect(fixture.componentInstance.price.value).toBe(12345.6);
    await blur('price');
    expect(input('price').value).toBe('$12,345.60');
  });

  it('steps with the arrow keys and clamps to min and max', async () => {
    await type('999');
    await key('ArrowUp');
    expect(fixture.componentInstance.amount.value).toBe(1000);
    await key('ArrowUp');
    expect(fixture.componentInstance.amount.value).toBe(1000);
    await key('Home');
    expect(fixture.componentInstance.amount.value).toBe(0);
    await key('ArrowDown');
    expect(fixture.componentInstance.amount.value).toBe(0);
    await type('5000');
    await blur();
    expect(fixture.componentInstance.amount.value).toBe(1000);
    expect(input().value).toBe('1,000');
  });

  it('ignores the minus sign when min is not negative and handles decimal steps', async () => {
    await type('-5');
    expect(fixture.componentInstance.amount.value).toBe(5);
    fixture.componentInstance.step.set(0.1);
    await fixture.whenStable();
    await key('ArrowUp');
    expect(fixture.componentInstance.amount.value).toBe(5.1);
  });

  it('steps with the buttons and disables them at the limits', async () => {
    const increment = el('#amount .tx-input-number__increment') as HTMLButtonElement;
    expect(increment.getAttribute('aria-label')).toBe('Increase');
    expect(increment.tabIndex).toBe(-1);
    increment.dispatchEvent(new MouseEvent('pointerdown', { button: 0, cancelable: true }));
    increment.dispatchEvent(new MouseEvent('pointerup'));
    await fixture.whenStable();
    expect(fixture.componentInstance.amount.value).toBe(1);
    fixture.componentInstance.amount.setValue(1000);
    await fixture.whenStable();
    expect(increment.disabled).toBe(true);
  });

  it('clears to null, or to min when empty is not allowed', async () => {
    fixture.componentInstance.amount.setValue(10);
    await fixture.whenStable();
    (el('#amount .tx-input-number__clear') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.amount.value).toBeNull();
    fixture.componentInstance.allowEmpty.set(false);
    await fixture.whenStable();
    await type('');
    await blur();
    expect(fixture.componentInstance.amount.value).toBe(0);
  });

  it('follows the locale separators', async () => {
    await TestBed.inject(TxLocaleService).setLocale('ua');
    await fixture.whenStable();
    expect(input('price').value).toMatch(/^1\s234,50\sUSD$/);
    await type('1234.5', 'amount');
    expect(input().value).toBe('1 234,5');
    expect(fixture.componentInstance.amount.value).toBe(1234.5);
  });

  it('switches the button layout', async () => {
    fixture.componentInstance.layout.set('horizontal');
    await fixture.whenStable();
    expect(el('#amount').getAttribute('data-layout')).toBe('horizontal');
    const buttons = Array.from(el('#amount').querySelectorAll('button.tx-input-number__button'));
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual(['Decrease', 'Increase']);
  });
});

@Component({
  imports: [TxInputNumber],
  template: `
    <tx-input-number
      ariaLabel="Count"
      [min]="min()"
      [max]="max()"
      [readonly]="readonly()"
      [allowEmpty]="allowEmpty()"
      showButtons
      buttonLayout="vertical"
      incrementIcon="my-plus"
      decrementIcon="my-minus"
      (changed)="changes.push($event.value)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LooseHost {
  readonly min = signal<number | undefined>(undefined);
  readonly max = signal<number | undefined>(undefined);
  readonly readonly = signal(false);
  readonly allowEmpty = signal(true);
  readonly changes: (number | null)[] = [];
}

describe('TxInputNumber without limits', () => {
  let fixture: ComponentFixture<LooseHost>;
  let component: TxInputNumber;
  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const key = (name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, cancelable: true });
    input().dispatchEvent(event);
    return event;
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(LooseHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    component = fixture.debugElement.children[0].componentInstance as TxInputNumber;
  });

  afterEach(() => vi.useRealTimers());

  it('draws unknown button icons as classes', () => {
    expect(fixture.nativeElement.querySelector('.tx-input-number__increment span')?.className).toBe('my-plus');
    expect(fixture.nativeElement.querySelector('.tx-input-number__decrement span')?.className).toBe('my-minus');
  });

  it('leaves Home and End alone without limits and jumps to the max with End', async () => {
    expect(key('Home').defaultPrevented).toBe(false);
    expect(key('End').defaultPrevented).toBe(false);
    fixture.componentInstance.max.set(50);
    await fixture.whenStable();
    expect(key('End').defaultPrevented).toBe(true);
    expect(fixture.componentInstance.changes).toEqual([50]);
    expect(input().value).toBe('50');
  });

  it('commits on Enter and ignores keys while read-only', async () => {
    input().value = '7';
    input().dispatchEvent(new Event('input'));
    key('Enter');
    expect(fixture.componentInstance.changes).toEqual([7]);
    fixture.componentInstance.readonly.set(true);
    await fixture.whenStable();
    expect(key('ArrowUp').defaultPrevented).toBe(false);
    expect(component.value()).toBe(7);
  });

  it('reads the caret from the end when the input has no selection', () => {
    Object.defineProperty(input(), 'selectionStart', { configurable: true, get: () => null });
    input().value = '-42';
    input().dispatchEvent(new Event('input'));
    expect(component.value()).toBe(-42);
  });

  it('keeps an empty value on blur, or falls back to zero without empty and min', async () => {
    input().dispatchEvent(new Event('blur'));
    expect(component.value()).toBeNull();
    fixture.componentInstance.allowEmpty.set(false);
    await fixture.whenStable();
    input().dispatchEvent(new Event('blur'));
    expect(component.value()).toBe(0);
    component.clear(new Event('click'));
    expect(component.value()).toBe(0);
  });

  it('repeats the step while a button is held and only for the main button', () => {
    const increment = fixture.nativeElement.querySelector('.tx-input-number__increment') as HTMLButtonElement;
    increment.dispatchEvent(new MouseEvent('pointerdown', { button: 2, cancelable: true }));
    expect(component.value()).toBeNull();
    vi.useFakeTimers();
    increment.dispatchEvent(new MouseEvent('pointerdown', { button: 0, cancelable: true }));
    expect(component.value()).toBe(1);
    vi.advanceTimersByTime(400);
    expect(component.value()).toBe(2);
    vi.advanceTimersByTime(120);
    expect(component.value()).toBe(4);
    increment.dispatchEvent(new MouseEvent('pointerleave'));
    vi.advanceTimersByTime(500);
    expect(component.value()).toBe(4);
  });

  it('stops repeating at the limit', async () => {
    fixture.componentInstance.max.set(2);
    await fixture.whenStable();
    const increment = fixture.nativeElement.querySelector('.tx-input-number__increment') as HTMLButtonElement;
    vi.useFakeTimers();
    increment.dispatchEvent(new MouseEvent('pointerdown', { button: 0, cancelable: true }));
    vi.advanceTimersByTime(400);
    expect(component.value()).toBe(2);
    vi.advanceTimersByTime(600);
    expect(component.value()).toBe(2);
  });
});
