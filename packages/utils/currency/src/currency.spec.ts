import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxCurrencySymbolPipe, currencySymbol } from './currency';

@Component({
  imports: [TxCurrencySymbolPipe],
  template: `{{ code() | txCurrencySymbol: 'name' }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CurrencyHost {
  readonly code = signal('UAH');
}

describe('currencySymbol', () => {
  it('finds the symbol of any ISO currency', () => {
    expect(currencySymbol('USD')).toBe('$');
    expect(currencySymbol('eur')).toBe('€');
    expect(currencySymbol('UAH')).toBe('₴');
    expect(currencySymbol('JPY')).toBe('¥');
    expect(currencySymbol('CAD', 'en-US', 'symbol')).toBe('CA$');
    expect(currencySymbol('CAD', 'en-US', 'code')).toBe('CAD');
  });

  it('returns the code when unknown and nothing when empty', () => {
    expect(currencySymbol('XYZ1')).toBe('XYZ1');
    expect(currencySymbol('')).toBe('');
    expect(currencySymbol(null)).toBe('');
  });

  it('names a currency in the tectra locale', () => {
    const fixture = TestBed.createComponent(CurrencyHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Ukrainian Hryvnia');
    TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('українська гривня');
  });
});
