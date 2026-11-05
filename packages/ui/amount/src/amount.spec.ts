import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra/core/i18n';
import { TxAmount } from './amount.component';
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
  });

  it('splits the currency from the number and keeps an unknown code', () => {
    expect(formatAmount(1234.5, { locale: 'en-US', currency: 'USD', format: '1.2-2' })).toEqual([
      { text: '$', currency: true },
      { text: '1,234.50', currency: false },
    ]);
    const unknown = formatAmount(10, { locale: 'en-US', currency: 'points' });
    expect(unknown[unknown.length - 1]).toEqual({ text: 'points', currency: true });
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
    expect(text(el('#compact'))).toBe('1.23M');
    expect(el('#compact').classList).toContain('tx-amount--strong');
  });

  it('follows the current locale', async () => {
    TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.componentInstance.currency.set('UAH');
    await fixture.whenStable();
    expect(text(el('#money'))).toBe('+1 234,50 ₴');
  });
});
