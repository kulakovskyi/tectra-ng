import { TestBed } from '@angular/core/testing';
import { TX_LOCALE_LOADERS, TxLocaleRegistry } from './locale-registry';
import { TxLocaleDefinition } from './tectra-config.interface';

describe('TxLocaleRegistry', () => {
  it('loads a built-in locale once and keeps it', async () => {
    const registry = TestBed.inject(TxLocaleRegistry);
    expect(registry.get('ua')).toBeUndefined();
    const ua = await registry.load('ua');
    expect(ua?.code).toBe('ua');
    expect(registry.get('ua')).toBe(ua);
    expect(await registry.load('ua')).toBe(ua);
  });

  it('knows the locales added to it and nothing it cannot load', async () => {
    const registry = TestBed.inject(TxLocaleRegistry);
    const own = { code: 'gb', intl: 'en-GB', firstDayOfWeek: 1, translations: {} } as TxLocaleDefinition;
    registry.add(own);
    expect(await registry.load('gb')).toBe(own);
    expect(await registry.load('xx')).toBeUndefined();
    expect(Object.keys(TX_LOCALE_LOADERS)).toEqual(['ua']);
  });
});
