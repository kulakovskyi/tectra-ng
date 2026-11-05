import { TestBed } from '@angular/core/testing';
import { provideTectra } from '@tectra/core/config';
import { InkPreset } from '@tectra/themes';
import { TX_LOCALE_UA } from './locales';
import { TxLocaleService } from './locale.service';
import { injectTranslations } from './translations';

describe('TxLocaleService', () => {
  it('starts in English and switches to Ukrainian at runtime', () => {
    const service = TestBed.inject(TxLocaleService);
    const translations = TestBed.runInInjectionContext(() => injectTranslations());
    expect(translations().emptyMessage).toBe('No results found');
    service.setLocale('ua');
    expect(translations().emptyMessage).toBe(TX_LOCALE_UA.translations.emptyMessage);
    expect(service.weekdayNames('short')[0].toLowerCase()).toContain('пн');
  });

  it('applies the configured locale and overrides', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: InkPreset, locale: 'ua', translations: { clear: 'Скинути' } })] });
    const service = TestBed.inject(TxLocaleService);
    expect(service.locale().code).toBe('ua');
    expect(service.translations().clear).toBe('Скинути');
  });

  it('fills parameters and formats with Intl', () => {
    const service = TestBed.inject(TxLocaleService);
    expect(service.translate('pageReport', { first: 1, last: 10, total: 42 })).toBe('1–10 of 42');
    expect(service.monthNames('long')[0]).toBe('January');
    expect(service.weekdayNames('short')[0]).toBe('Sun');
    expect(service.formatNumber(1234.5)).toBe('1,234.5');
  });
});
