import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxNumberInput, TxNumberPipe, formatLocaleNumber } from './number';

const uk = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat('uk-UA', options).format(value);

@Component({
  imports: [TxNumberPipe],
  template: `<span class="auto">{{ value() | txNumber }}</span><span class="percent">{{ value() | txNumber: { style: 'percent', locale: 'en-US' } }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NumberHost {
  readonly value = signal<TxNumberInput>(1234.5);
}

describe('number', () => {
  it('formats numbers, numeric strings and bigints with Intl options', () => {
    expect(formatLocaleNumber(1234.5)).toBe('1,234.5');
    expect(formatLocaleNumber('1234.567', { maximumFractionDigits: 2 })).toBe('1,234.57');
    expect(formatLocaleNumber(12345678901234567890n)).toBe('12,345,678,901,234,567,890');
    expect(formatLocaleNumber(0.25, { style: 'percent' })).toBe('25%');
    expect(formatLocaleNumber(1500, { notation: 'compact' })).toBe('1.5K');
    expect(formatLocaleNumber(1234.5, { locale: 'uk-UA' })).toBe(uk(1234.5));
  });

  it('shows the empty text for nothing, broken values and bad options', () => {
    for (const value of [null, undefined, '', ' ', 'abc', Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(formatLocaleNumber(value)).toBe('-');
    }
    expect(formatLocaleNumber(null, { empty: '—' })).toBe('—');
    expect(formatLocaleNumber(5, { style: 'currency' })).toBe('-');
  });

  it('follows the tectra locale unless the pipe gets one', async () => {
    const fixture = TestBed.createComponent(NumberHost);
    fixture.detectChanges();
    const text = (selector: string) => (fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent;
    expect(text('.auto')).toBe('1,234.5');
    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.detectChanges();
    expect(text('.auto')).toBe(uk(1234.5));
    expect(text('.percent')).toBe('123,450%');
    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    expect(text('.auto')).toBe('-');
  });
});
