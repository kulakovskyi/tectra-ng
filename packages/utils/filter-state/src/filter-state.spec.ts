import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component, DOCUMENT, Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { txFilterState } from './filter-state';
import { TxUrlFilters } from './filter-state.base';
import { TxMemoryStorage, injectStorage, readJson, writeJson } from './storage';
import { decodeUrlFilterValue, encodeUrlFilterValue, filtersToQueryParams, queryParamsToFilters } from './url-filters.functions';

interface Filters {
  search: string;
  status: string[];
  page: number;
}

const INITIAL: Filters = { search: '', status: [], page: 1 };

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class ListPage {
  readonly filters = txFilterState({ key: 'orders', initial: INITIAL, url: true });
}

@Injectable()
class OrdersFilters extends TxUrlFilters<Filters> {
  protected localStorageKey = 'legacy-orders';
  applied: Filters | null = null;

  protected initialFilters(): Filters {
    return INITIAL;
  }

  protected override applyUrlFilters(filters: Filters): void {
    this.applied = filters;
  }

  save(filters: Filters): void {
    this.storeFilters(filters);
  }

  load(): Filters | null {
    return this.getStoredFilters();
  }
}

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush, providers: [OrdersFilters] })
class LegacyPage {
  readonly filters = inject(OrdersFilters);
}

@Injectable()
class PlainFilters extends TxUrlFilters<Filters> {
  protected localStorageKey = 'plain-orders';

  protected initialFilters(): Filters {
    return INITIAL;
  }

  save(filters: Filters): void {
    this.storeFilters(filters);
  }
}

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush, providers: [OrdersFilters, PlainFilters] })
class HistoryPage {
  readonly filters = txFilterState({ key: 'orders', initial: INITIAL, url: true });
  readonly legacy = inject(OrdersFilters);
  readonly plain = inject(PlainFilters);
}

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class LocalPage {
  readonly memory = txFilterState({ key: 'orders', initial: INITIAL, storage: false });
  readonly session = txFilterState({ key: 'orders', initial: INITIAL, storage: 'session' });
}

async function setup(url = '/orders') {
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'orders', component: ListPage }, { path: 'other', component: ListPage }])] });
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  return router;
}

describe('url filter functions', () => {
  it('encodes only the values that differ from the initial ones', () => {
    expect(filtersToQueryParams({ search: 'kyiv', status: ['paid'], page: 1 }, INITIAL)).toEqual({ search: 'kyiv', status: '["paid"]', page: null });
    expect(queryParamsToFilters({ status: '["paid"]', page: '3', other: 'x' }, INITIAL)).toEqual({ search: '', status: ['paid'], page: 3 });
    expect(queryParamsToFilters({ other: 'x' }, INITIAL)).toBeNull();
    expect(encodeUrlFilterValue('12')).toBe('"12"');
    expect(decodeUrlFilterValue('"12"')).toBe('12');
    expect(decodeUrlFilterValue('plain text')).toBe('plain text');
    expect(encodeUrlFilterValue('')).toBe('');
  });
});

describe('storage', () => {
  it('copies a source and works as Storage', () => {
    const source = new TxMemoryStorage();
    source.setItem('a', '1');
    const copy = new TxMemoryStorage(source);
    copy.setItem('b', '2');
    expect(copy.length).toBe(2);
    expect(copy.key(1)).toBe('b');
    copy.removeItem('a');
    expect(copy.getItem('a')).toBeNull();
    copy.clear();
    expect(copy.length).toBe(0);
  });

  it('gives a memory storage on request', () => {
    const storage = TestBed.runInInjectionContext(() => injectStorage('memory'));
    expect(storage).toBeInstanceOf(TxMemoryStorage);
  });

  it('copies a source with gaps and returns null past the last key', () => {
    const source = { length: 2, key: (index: number) => (index === 0 ? 'a' : null), getItem: () => null } as unknown as Storage;
    const copy = new TxMemoryStorage(source);
    expect(copy.getItem('a')).toBe('');
    expect(copy.key(0)).toBe('a');
    expect(copy.key(5)).toBeNull();
  });

  it('falls back to memory without a window or when the browser storage throws', () => {
    const storageIn = (defaultView: unknown) =>
      runInInjectionContext(Injector.create({ providers: [{ provide: DOCUMENT, useValue: { defaultView } }], parent: TestBed.inject(Injector) }), () => injectStorage('session'));
    const blocked = {
      get sessionStorage(): Storage {
        throw new Error('blocked');
      },
    };
    expect(storageIn(null)).toBeInstanceOf(TxMemoryStorage);
    expect(storageIn(blocked)).toBeInstanceOf(TxMemoryStorage);
    expect(TestBed.runInInjectionContext(() => injectStorage('session'))).toBe(sessionStorage);
  });

  it('reads broken JSON as nothing and survives a full storage', () => {
    const storage = new TxMemoryStorage();
    storage.setItem('broken', '{');
    expect(readJson(storage, 'broken')).toBeNull();
    const full = { setItem: () => { throw new Error('quota'); } } as unknown as Storage;
    expect(() => writeJson(full, 'key', { a: 1 })).not.toThrow();
  });
});

describe('txFilterState', () => {
  beforeEach(() => localStorage.clear());

  it('starts from the initial filters and saves changes in storage and the URL', async () => {
    const router = await setup();
    const { filters } = TestBed.createComponent(ListPage).componentInstance;
    expect(filters.value()).toEqual(INITIAL);
    expect(filters.isInitial()).toBe(true);

    filters.patch({ search: 'lviv', status: ['paid'] });
    await TestBed.inject(Router).navigated;
    await new Promise((resolve) => setTimeout(resolve));
    expect(router.url).toBe('/orders?search=lviv&status=%5B%22paid%22%5D');
    expect(JSON.parse(localStorage.getItem('orders') ?? '{}')).toEqual({ search: 'lviv', status: ['paid'], page: 1 });
    expect(filters.changed()).toEqual(['search', 'status']);

    filters.reset();
    await new Promise((resolve) => setTimeout(resolve));
    expect(router.url).toBe('/orders');
    expect(localStorage.getItem('orders')).toBeNull();
  });

  it('prefers the URL, then storage merged with new keys', async () => {
    localStorage.setItem('orders', JSON.stringify({ search: 'stored' }));
    await setup('/orders?page=4');
    expect(TestBed.createComponent(ListPage).componentInstance.filters.value()).toEqual({ ...INITIAL, page: 4 });
  });

  it('reads storage when the URL has no filters', async () => {
    localStorage.setItem('orders', JSON.stringify({ search: 'stored' }));
    await setup('/orders');
    expect(TestBed.createComponent(ListPage).componentInstance.filters.value()).toEqual({ ...INITIAL, search: 'stored' });
  });

  it('ignores stored values that are not objects', async () => {
    localStorage.setItem('orders', '5');
    await setup('/orders');
    expect(TestBed.createComponent(ListPage).componentInstance.filters.value()).toEqual(INITIAL);
  });

  it('keeps filters in memory or in the session without the URL', () => {
    sessionStorage.clear();
    const { memory, session } = TestBed.createComponent(LocalPage).componentInstance;
    memory.patch({ page: 2 });
    session.patch({ page: 3 });
    expect(memory.value().page).toBe(2);
    expect(localStorage.getItem('orders')).toBeNull();
    expect(JSON.parse(sessionStorage.getItem('orders') ?? '{}').page).toBe(3);
  });
});

describe('filters and browser history', () => {
  beforeEach(() => localStorage.clear());

  const settle = () => new Promise((resolve) => setTimeout(resolve));

  async function historySetup() {
    TestBed.configureTestingModule({ providers: [provideLocationMocks(), provideRouter([{ path: 'orders', component: ListPage }, { path: 'other', component: ListPage }])] });
    const router = TestBed.inject(Router);
    router.initialNavigation();
    await router.navigateByUrl('/orders');
    const page = TestBed.createComponent(HistoryPage).componentInstance;
    return { router, location: TestBed.inject(Location), page };
  }

  it('takes the filters back from the URL on back and forward', async () => {
    const { router, location, page } = await historySetup();
    page.filters.patch({ search: 'a' });
    await settle();
    await router.navigateByUrl('/orders');
    page.filters.patch({ search: 'b' });
    await settle();
    expect(router.url).toBe('/orders?search=b');

    location.back();
    await settle();
    expect(page.filters.value()).toEqual(INITIAL);
    expect(page.legacy.applied).toEqual(INITIAL);

    location.forward();
    await settle();
    expect(page.filters.value().search).toBe('b');
    expect(page.legacy.applied?.search).toBe('b');
  });

  it('leaves the URL of another page alone and ignores history there', async () => {
    const { router, location, page } = await historySetup();
    page.filters.patch({ search: 'a' });
    await settle();
    await router.navigateByUrl('/other');
    page.filters.patch({ search: 'c' });
    page.plain.save({ ...INITIAL, page: 9 });
    await settle();
    expect(router.url).toBe('/other');

    location.back();
    await settle();
    expect(page.filters.value().search).toBe('a');
    location.forward();
    await settle();
    expect(router.url).toBe('/other');
    expect(page.filters.value().search).toBe('a');
  });

  it('does not navigate when the URL already holds the filters', async () => {
    const { router, page } = await historySetup();
    const navigate = vi.spyOn(router, 'navigateByUrl');
    page.filters.set(INITIAL);
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('TxUrlFilters', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the protected API of a filters base class', async () => {
    const router = await setup();
    const { filters } = TestBed.createComponent(LegacyPage).componentInstance;
    expect(filters.load()).toBeNull();
    filters.save({ search: 'odesa', status: [], page: 2 });
    await new Promise((resolve) => setTimeout(resolve));
    expect(router.url).toBe('/orders?search=odesa&page=2');
    expect(JSON.parse(localStorage.getItem('legacy-orders') ?? '{}').search).toBe('odesa');
    expect(filters.load()).toEqual({ search: 'odesa', status: [], page: 2 });
  });
});
