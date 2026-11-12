import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleDefinition, provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { TX_LOCALE_UA } from '@tectra-ng/core/i18n/ua';
import { TX_LOCALE_US } from './locales';
import { formatMessage } from './format-message';
import { TxLocaleService } from './locale.service';
import { injectTranslations } from './translations';

describe('TxLocaleService', () => {
  it('starts in English and switches to Ukrainian at runtime', async () => {
    const service = TestBed.inject(TxLocaleService);
    const translations = TestBed.runInInjectionContext(() => injectTranslations());
    expect(translations().emptyMessage).toBe('No results found');
    await service.setLocale('ua');
    expect(translations().emptyMessage).toBe(TX_LOCALE_UA.translations.emptyMessage);
    expect(service.weekdayNames('short')[0].toLowerCase()).toContain('пн');
  });

  it('loads the configured locale before the app starts and applies the overrides', async () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, locale: 'ua', translations: { clear: 'Скинути' } })] });
    await TestBed.inject(ApplicationInitStatus).donePromise;
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
    expect(service.formatDate(new Date(2024, 2, 5), { month: 'short', day: 'numeric' })).toBe('Mar 5');
  });

  it('picks plural forms by the locale rules', async () => {
    const domains = '{count, plural, one {# domain} other {# domains}} found';
    expect(formatMessage(domains, { count: 1 })).toBe('1 domain found');
    expect(formatMessage(domains, { count: 5 })).toBe('5 domains found');
    const ua = '{count, plural, one {# домен} few {# домени} many {# доменів} other {# домена}}';
    expect([1, 3, 5, 21, 1.5].map((count) => formatMessage(ua, { count }, 'uk-UA'))).toEqual(['1 домен', '3 домени', '5 доменів', '21 домен', '1.5 домена']);
    expect(formatMessage('{n, plural, =0 {none} other {{n} of {total}}}', { n: 0, total: 9 })).toBe('none');
    expect(formatMessage('{n, plural, =0 {none} other {{n} of {total}}}', { n: 2, total: 9 })).toBe('2 of 9');
    expect(formatMessage('Keep {missing}', {})).toBe('Keep {missing}');
    expect(formatMessage('{n, plural, =0 {none} other {# left}}')).toBe('none');
    expect(formatMessage('{n, plural, =3 {three}} left', { n: 1 })).toBe(' left');
    expect(formatMessage('{n, plural, one {# item}', { n: 1 })).toBe('1 item');
    const service = TestBed.inject(TxLocaleService);
    await service.setLocale('ua');
    expect(service.format('{count, plural, one {# рядок} few {# рядки} other {# рядків}}', { count: 2 })).toBe('2 рядки');
  });

  it('switches to the configured locale even when the service starts before the app initializers', async () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, locale: 'ua' })] });
    const service = TestBed.inject(TxLocaleService);
    await vi.waitFor(() => expect(service.locale().code).toBe('ua'));
  });

  it('switches at once to a locale registered with provideTectra', () => {
    const own: TxLocaleDefinition = { ...TX_LOCALE_US, code: 'gb', intl: 'en-GB', firstDayOfWeek: 1 };
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, locales: [own] })] });
    TestBed.inject(ApplicationInitStatus);
    const service = TestBed.inject(TxLocaleService);
    void service.setLocale('gb');
    expect(service.locale()).toBe(own);
  });

  it('keeps the last choice when an earlier one finishes loading later', async () => {
    const service = TestBed.inject(TxLocaleService);
    const loading = service.setLocale('ua');
    await service.setLocale('us');
    await loading;
    expect(service.locale().code).toBe('us');
  });

  it('falls back to English for a code it does not know', async () => {
    const service = TestBed.inject(TxLocaleService);
    await service.setLocale('xx');
    expect(service.locale()).toBe(TX_LOCALE_US);
    await service.setLocale(TX_LOCALE_UA);
    expect(service.locale()).toBe(TX_LOCALE_UA);
  });
});
