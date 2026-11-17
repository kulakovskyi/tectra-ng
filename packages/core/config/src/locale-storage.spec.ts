import { DOCUMENT, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tectra } from '@tectra-ng/themes';
import { TxLocaleStorage } from './locale-storage';
import { TECTRA_CONFIG } from './tectra-config.token';

describe('TxLocaleStorage', () => {
  const key = 'tx-locale-storage-spec';

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(key);
  });

  function create(localeStorageKey?: string, platform = 'browser'): TxLocaleStorage {
    TestBed.configureTestingModule({
      providers: [
        { provide: TECTRA_CONFIG, useValue: { preset: Tectra, localeStorageKey } },
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
    return TestBed.inject(TxLocaleStorage);
  }

  it('keeps nothing without a key', () => {
    const storage = create();
    storage.write('ua');
    expect(storage.read()).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('writes and reads the code under the key', () => {
    const storage = create(key);
    expect(storage.read()).toBeNull();
    storage.write('ua');
    expect(localStorage.getItem(key)).toBe('ua');
    expect(storage.read()).toBe('ua');
    localStorage.setItem(key, '');
    expect(storage.read()).toBeNull();
  });

  it('reads and writes nothing on the server', () => {
    localStorage.setItem(key, 'ua');
    const storage = create(key, 'server');
    expect(storage.read()).toBeNull();
    storage.write('us');
    expect(localStorage.getItem(key)).toBe('ua');
  });

  it('survives a storage that throws', () => {
    const storage = create(key);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(storage.read()).toBeNull();
    expect(() => storage.write('ua')).not.toThrow();
  });

  it('survives a window without storage access', () => {
    const storage = create(key);
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(storage.read()).toBeNull();
    expect(() => storage.write('ua')).not.toThrow();
  });

  it('keeps nothing in a document without a window', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TECTRA_CONFIG, useValue: { preset: Tectra, localeStorageKey: key } },
        { provide: DOCUMENT, useValue: { defaultView: null } },
      ],
    });
    const storage = TestBed.inject(TxLocaleStorage);
    storage.write('ua');
    expect(storage.read()).toBeNull();
    expect(localStorage.getItem(key)).toBeNull();
  });
});
