import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxAmount } from './amount.component';
import { provideTxAmount } from './amount.options';
import { TxAmountFormatOptions } from './amount.types';
import { formatAmount, parseDigitsInfo } from './format-amount';

@Component({
  imports: [TxAmount],
  template: `
    <tx-amount id="money" [amount]="amount()" [currency]="currency()" [format]="format()" [signColor]="true" [showSign]="true" />
    <tx-amount id="empty" [amount]="null" />
    <tx-amount id="compact" [amount]="1234567" notation="compact" [strong]="true" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly amount = signal<number | null>(1234.5);
  readonly currency = signal<string | null>('USD');
  readonly format = signal('1.2-2');
}

const text = (element: HTMLElement) => (element.textContent ?? '').replace(/\s/g, ' ');

describe('formatAmount', () => {
  it('reads the digits notation', () => {
    expect(parseDigitsInfo('1.0-2')).toEqual({ minimumIntegerDigits: 1, minimumFractionDigits: 0, maximumFractionDigits: 2 });
    expect(parseDigitsInfo('1.2')).toEqual({ minimumIntegerDigits: 1, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    expect(parseDigitsInfo('wrong')).toEqual({});
    expect(parseDigitsInfo('2-3')).toEqual({ minimumIntegerDigits: 2, maximumFractionDigits: 3 });
  });

  it('splits the currency from the number and keeps an unknown code', () => {
    expect(formatAmount(1234.5, { locale: 'en-US', currency: 'USD', format: '1.2-2' })).toEqual([
      { text: '$', currency: true },
      { text: '1,234.50', currency: false },
    ]);
    const unknown = formatAmount(10, { locale: 'en-US', currency: 'points' });
    expect(unknown[unknown.length - 1]).toEqual({ text: 'points', currency: true });
    expect(formatAmount(10.125, { locale: 'en-US', currency: 'points' })[0].text.trim()).toBe('10.13');
  });

  it('keeps the minor digits of the currency without a format', () => {
    expect(formatAmount(318.6, { locale: 'en-US', currency: 'USD' }).map((segment) => segment.text).join('')).toBe('$318.60');
    expect(formatAmount(318.6, { locale: 'en-US', currency: 'JPY' }).map((segment) => segment.text).join('')).toBe('¥319');
    expect(formatAmount(318.6, { locale: 'en-US', currency: 'USD', format: '1.0-2' }).map((segment) => segment.text).join('')).toBe('$318.6');
    expect(formatAmount(318.625, { locale: 'en-US' }).map((segment) => segment.text).join('')).toBe('318.63');
  });
});

const joined = (amount: number, options: TxAmountFormatOptions) => formatAmount(amount, options).map((segment) => segment.text).join('').replace(/\s/g, ' ');

describe('formatAmount symbol position and own symbols', () => {
  it('puts the currency after or before the number in any locale', () => {
    expect(joined(1234.5, { locale: 'en-US', currency: 'USD', format: '1.0-2', symbolPosition: 'after' })).toBe('1,234.5 $');
    expect(joined(-5, { locale: 'en-US', currency: 'USD', symbolPosition: 'after' })).toBe('-5.00 $');
    expect(joined(1234.5, { locale: 'uk-UA', currency: 'UAH', symbolPosition: 'before' })).toBe('₴1 234,50');
    expect(joined(-5, { locale: 'uk-UA', currency: 'UAH', symbolPosition: 'before', showSign: true })).toBe('-₴5,00');
    expect(joined(5, { locale: 'en-US', currency: 'USD', currencyDisplay: 'code', symbolPosition: 'before' })).toBe('USD 5.00');
    expect(joined(5, { locale: 'en-US', currency: 'USD', symbolPosition: 'auto' })).toBe('$5.00');
    expect(joined(5, { locale: 'en-US', symbolPosition: 'after' })).toBe('5');
  });

  it('writes own symbols for known and unknown codes', () => {
    expect(joined(10, { locale: 'en-US', currency: 'USD', symbols: { USD: 'US$' } })).toBe('US$10.00');
    expect(joined(10, { locale: 'en-US', currency: 'usdt', symbols: { USDT: '₮' } })).toBe('10 ₮');
    expect(joined(10, { locale: 'en-US', currency: 'USDT', symbols: { USDT: '₮' }, symbolPosition: 'before' })).toBe('₮10');
    expect(joined(10, { locale: 'en-US', currency: 'USDT', symbols: { EUR: '€' }, symbolPosition: 'after' })).toBe('10 USDT');
    const segments = formatAmount(10, { locale: 'en-US', currency: 'USD', symbols: { USD: 'dollars' }, symbolPosition: 'after' });
    expect(segments[segments.length - 1]).toEqual({ text: 'dollars', currency: true });
  });
});

@Component({
  imports: [TxAmount],
  template: `
    <tx-amount id="app" [amount]="1234.5" currency="USD" format="1.0-2" />
    <tx-amount id="own" [amount]="3" currency="USDT" symbolPosition="before" [symbols]="{ USDT: '₮' }" locale="en-US" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {}

describe('TxAmount with app-wide options', () => {
  it('takes the number locale, the symbol position and own symbols from provideTxAmount', async () => {
    TestBed.configureTestingModule({ providers: [provideTxAmount({ locale: 'en-US', symbolPosition: 'after', symbols: { USD: 'USD', USDT: 'T' } })] });
    await TestBed.inject(TxLocaleService).setLocale('ua');
    const fixture = TestBed.createComponent(OptionsHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
    expect(text(el('#app'))).toBe('1,234.5 USD');
    expect(text(el('#own'))).toBe('₮3');
    await TestBed.inject(TxLocaleService).setLocale('en');
  });
});

describe('TxAmount', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('formats money with the sign and its colour', async () => {
    expect(text(el('#money'))).toBe('+$1,234.50');
    expect(el('#money .tx-amount__currency').textContent).toBe('$');
    expect(el('#money').getAttribute('data-sign')).toBe('positive');
    fixture.componentInstance.amount.set(-5);
    await fixture.whenStable();
    expect(text(el('#money'))).toBe('-$5.00');
    expect(el('#money').getAttribute('data-sign')).toBe('negative');
    fixture.componentInstance.amount.set(0);
    await fixture.whenStable();
    expect(el('#money').classList).toContain('tx-amount--zero');
  });

  it('shows a dash without a value, compact numbers and strong', () => {
    expect(el('#empty').textContent?.trim()).toBe('—');
    expect(el('#empty').classList).toContain('tx-amount--empty');
    const empty = fixture.debugElement.query((node) => node.nativeElement.id === 'empty').componentInstance as TxAmount;
    expect(empty.segments()).toEqual([]);
    expect(empty.sign()).toBeNull();
    expect(text(el('#compact'))).toBe('1.23M');
    expect(el('#compact').classList).toContain('tx-amount--strong');
  });

  it('follows the current locale', async () => {
    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.componentInstance.currency.set('UAH');
    await fixture.whenStable();
    expect(text(el('#money'))).toBe('+1 234,50 ₴');
  });
});
