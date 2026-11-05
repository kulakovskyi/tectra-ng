import { TestBed } from '@angular/core/testing';
import { provideTectra } from '@tectra/core/config';
import { InkPreset } from '@tectra/themes';
import { DEFAULT_TRANSLATIONS } from './default-translations';
import { injectTranslations } from './translations';

describe('injectTranslations', () => {
  it('returns defaults without config', () => {
    expect(TestBed.runInInjectionContext(() => injectTranslations())).toEqual(DEFAULT_TRANSLATIONS);
  });

  it('applies overrides from provideTectra', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: InkPreset, translations: { emptyMessage: 'Нічого' } })] });
    expect(TestBed.runInInjectionContext(() => injectTranslations()).emptyMessage).toBe('Нічого');
  });
});
