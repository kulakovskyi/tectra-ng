import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxPaginator } from '@tectra-ng/ui/paginator';
import { TxSelect } from '@tectra-ng/ui/select';
import { filtersToQueryParams, txFilterState } from '@tectra-ng/utils/filter-state';

const INITIAL = { sort: 'newest', page: 1 };

@Component({
  selector: 'filter-state-url-example',
  imports: [FormsModule, TxPaginator, TxSelect],
  template: `
    <div class="stack">
      <tx-select
        class="sort"
        ariaLabel="Sort"
        [options]="sorts"
        [ngModel]="filters.value().sort"
        (ngModelChange)="filters.patch({ sort: $event, page: 1 })"
      />
      <tx-paginator
        [totalRecords]="240"
        [rows]="20"
        [first]="(filters.value().page - 1) * 20"
        (pageChange)="filters.patch({ page: $event.page + 1 })"
      />
      <code class="hint">{{ query() }}</code>
    </div>
  `,
  styles: `
    .stack {
      max-width: none;
      align-items: flex-start;
    }
    .sort {
      width: 220px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FilterStateUrlExample {
  readonly sorts = [
    { label: 'Newest first', value: 'newest' },
    { label: 'Oldest first', value: 'oldest' },
    { label: 'Name', value: 'name' },
  ];
  readonly filters = txFilterState({
    key: 'docs-url-filters',
    initial: INITIAL,
    url: true,
    storage: false,
  });

  readonly query = computed(() => {
    const params = Object.entries(filtersToQueryParams(this.filters.value(), INITIAL)).filter(
      ([, value]) => value !== null,
    );
    return params.length
      ? '?' + params.map(([key, value]) => `${key}=${value}`).join('&')
      : 'no query params — the initial filters';
  });
}
