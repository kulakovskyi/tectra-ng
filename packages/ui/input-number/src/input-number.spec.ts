import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra/core/i18n';
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
    TestBed.inject(TxLocaleService).setLocale('ua');
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
