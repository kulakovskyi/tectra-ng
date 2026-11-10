import { TestBed } from '@angular/core/testing';
import { provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { TX_LOCALE_UA } from './locales';
import { formatMessage } from './format-message';
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
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, locale: 'ua', translations: { clear: 'Скинути' } })] });
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

  it('picks plural forms by the locale rules', () => {
    const domains = '{count, plural, one {# domain} other {# domains}} found';
    expect(formatMessage(domains, { count: 1 })).toBe('1 domain found');
    expect(formatMessage(domains, { count: 5 })).toBe('5 domains found');
    const ua = '{count, plural, one {# домен} few {# домени} many {# доменів} other {# домена}}';
    expect([1, 3, 5, 21, 1.5].map((count) => formatMessage(ua, { count }, 'uk-UA'))).toEqual(['1 домен', '3 домени', '5 доменів', '21 домен', '1.5 домена']);
    expect(formatMessage('{n, plural, =0 {none} other {{n} of {total}}}', { n: 0, total: 9 })).toBe('none');
    expect(formatMessage('{n, plural, =0 {none} other {{n} of {total}}}', { n: 2, total: 9 })).toBe('2 of 9');
    expect(formatMessage('Keep {missing}', {})).toBe('Keep {missing}');
    const service = TestBed.inject(TxLocaleService);
    service.setLocale('ua');
    expect(service.format('{count, plural, one {# рядок} few {# рядки} other {# рядків}}', { count: 2 })).toBe('2 рядки');
  });
});
