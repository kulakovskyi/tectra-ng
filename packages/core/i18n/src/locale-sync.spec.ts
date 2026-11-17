import { ApplicationInitStatus, InjectionToken, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { TxLocaleService } from './locale.service';
import { provideTxLocaleSync } from './locale-sync';

const APP_LANGUAGE = new InjectionToken<{ codes: string[] }>('APP_LANGUAGE', { factory: () => ({ codes: [] }) });

describe('provideTxLocaleSync', () => {
  it('mirrors the start locale and every change into the app', async () => {
    const intl: string[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideTectra({ preset: Tectra, locale: 'ua' }),
        provideTxLocaleSync((code, locale) => {
          inject(APP_LANGUAGE).codes.push(code);
          intl.push(locale.intl);
        }),
      ],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    await Promise.resolve();
    TestBed.tick();
    const language = TestBed.inject(APP_LANGUAGE);
    expect(language.codes).toEqual(['ua']);
    await TestBed.inject(TxLocaleService).setLocale('us');
    TestBed.tick();
    expect(language.codes).toEqual(['ua', 'us']);
    expect(intl).toEqual(['uk-UA', 'en-US']);
  });

  it('does nothing when the app is gone before it starts', async () => {
    const listener = vi.fn();
    TestBed.configureTestingModule({ providers: [provideTxLocaleSync(listener)] });
    const status = TestBed.inject(ApplicationInitStatus);
    TestBed.resetTestingModule();
    await status.donePromise;
    await Promise.resolve();
    expect(listener).not.toHaveBeenCalled();
  });
});
