# Filter State

Filters of a list page that survive a reload and can be shared as a link: a signal of the filters, saved in local storage and, when asked, in the query string — only the values that differ from the initial ones. Back and forward restore the filters of that history entry. On the server and with blocked storage it falls back to memory, so nothing throws.

```ts
readonly filters = txFilterState({ key: 'orders-filters', initial: { search: '', status: [] as string[], page: 1 }, url: true });

readonly orders = httpResource(() => ({ url: '/api/orders', params: buildHttpParams(this.filters.value()) }));
```

```html
<input txInput [ngModel]="filters.value().search" (ngModelChange)="filters.patch({ search: $event, page: 1 })" />
<button txButton label="Reset" [disabled]="filters.isInitial()" (click)="filters.reset()"></button>
```

Pages built on a base class keep their code: extend `TxUrlFilters<T>` (or `TxSaveFilters<T>` for storage only), set `localStorageKey` and `initialFilters()`, call `storeFilters()` / `getStoredFilters()`, override `applyUrlFilters()` to react to back and forward.

## Functions
| Name | Description |
|---|---|
| txFilterState({ key, initial, url?, storage? }) | Creates the state in an injection context; `url` (`false`) writes the query string, `storage` is `'local'` (default), `'session'`, `'memory'` or `false`. Start: URL → storage (merged over `initial`, so new keys get their defaults) → `initial` |
| injectStorage(kind?) | `localStorage` / `sessionStorage` when it works, a shared `TxMemoryStorage` on the server or when blocked |
| readJson(storage, key) / writeJson(storage, key, value) | JSON in a storage without throwing on broken data or a full quota |
| filtersToQueryParams(filters, initial) | Query params of the changed values, `null` for the rest (Angular removes them) |
| queryParamsToFilters(params, initial) | Filters from query params over `initial`, or `null` when the URL has none of their keys |
| encodeUrlFilterValue(value) / decodeUrlFilterValue(text) | Plain strings stay readable, everything else is JSON |

## Methods
| Name | Description |
|---|---|
| value | Signal of the current filters |
| isInitial | Signal: nothing differs from `initial` |
| changed | Signal: keys that differ from `initial` — for a "3 filters" badge |
| set(filters) | Replaces the filters and saves them |
| patch(filters) | Changes some keys |
| reset() | Back to `initial`; removes the stored copy and the query params |
