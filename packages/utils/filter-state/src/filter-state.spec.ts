import { ChangeDetectionStrategy, Component, Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { txFilterState } from './filter-state';
import { TxUrlFilters } from './filter-state.base';
import { TxMemoryStorage, injectStorage } from './storage';
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
