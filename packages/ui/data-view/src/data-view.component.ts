import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  untracked,
} from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraDataViewTokens, toStyleObject } from '@tectra-ng/themes';
import { TxPageState, TxPaginator, TxPaginatorEnd, TxPaginatorStart, TxRowsPerPageOption } from '@tectra-ng/ui/paginator';
import { TxProgressSpinner } from '@tectra-ng/ui/progress-spinner';
import { foldText, readOptionField } from '@tectra-ng/ui/select';
import { compareValues } from '@tectra-ng/ui/table';
import {
  TxDataViewEmpty,
  TxDataViewFooter,
  TxDataViewGrid,
  TxDataViewHeader,
  TxDataViewList,
  TxDataViewLoading,
  TxDataViewPaginatorEnd,
  TxDataViewPaginatorStart,
} from './data-view.templates';
import {
  TxDataViewItemsContext,
  TxDataViewLayout,
  TxDataViewLazyLoadEvent,
  TxDataViewPaginatorPosition,
  TxDataViewPart,
  TxDataViewSortEvent,
  TxDataViewSortOrder,
} from './data-view.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { DATA_VIEW_ICON_DEFAULTS } from './data-view.icons';

@Component({
  selector: 'tx-data-view',
  imports: [NgTemplateOutlet, TxPaginator, TxPaginatorStart, TxPaginatorEnd, TxProgressSpinner],
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-data-view',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-layout]': 'layout()',
    '[class.tx-data-view--loading]': 'loading()',
    '[attr.aria-busy]': 'loading() || null',
  },
  viewProviders: [provideTxIconDefaults(DATA_VIEW_ICON_DEFAULTS)],
})
export class TxDataView<T = unknown> {
  readonly value = input<readonly T[] | null | undefined>(undefined);
  readonly layout = model<TxDataViewLayout>('list');
  readonly paginator = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly paginatorPosition = input<TxDataViewPaginatorPosition>('bottom');
  readonly first = model(0);
  readonly rows = model(10);
  readonly totalRecords = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly pageLinks = input(5, { transform: numberAttribute });
  readonly rowsPerPageOptions = input<TxRowsPerPageOption[] | null | undefined>(undefined);
  readonly alwaysShowPaginator = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showCurrentPageReport = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  readonly showJumpToPageDropdown = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showJumpToPageInput = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showFirstLastIcon = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showPageLinks = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showTotal = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly lazy = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly lazyLoadOnInit = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly sortField = model<string | null>(null);
  readonly sortOrder = model<TxDataViewSortOrder>(null);
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterValue = model('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraDataViewTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxDataViewPart, TxDataView<T>> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly lazyLoad = output<TxDataViewLazyLoadEvent>();
  readonly pageChange = output<TxPageState>();
  readonly sortChange = output<TxDataViewSortEvent>();

  readonly listTemplate = contentChild(TxDataViewList);
  readonly gridTemplate = contentChild(TxDataViewGrid);
  readonly headerTemplate = contentChild(TxDataViewHeader);
  readonly footerTemplate = contentChild(TxDataViewFooter);
  readonly emptyTemplate = contentChild(TxDataViewEmpty);
  readonly loadingTemplate = contentChild(TxDataViewLoading);
  readonly paginatorStartTemplate = contentChild(TxDataViewPaginatorStart);
  readonly paginatorEndTemplate = contentChild(TxDataViewPaginatorEnd);

  private readonly localeService = inject(TxLocaleService);
  private lastSort = '';
  private lastFilter: string | null = null;
  private loadedOnce = false;

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('dataView', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-data-view'), ...this.passThrough().root?.style }));

  readonly filterFields = computed(() =>
    (this.filterBy() ?? '')
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean),
  );
  readonly filtered = computed<T[]>(() => {
    const items = [...(this.value() ?? [])];
    const query = foldText(this.filterValue().trim());
    const fields = this.filterFields();
    if (this.lazy() || !query || !fields.length) return items;
    return items.filter((item) => fields.some((field) => foldText(String(readOptionField(item, field) ?? '')).includes(query)));
  });
  readonly sorted = computed<T[]>(() => {
    const items = this.filtered();
    const field = this.sortField();
    const order = this.sortOrder();
    if (this.lazy() || !field || !order) return items;
    const intl = this.localeService.locale().intl;
    const direction = order === 'desc' ? -1 : 1;
    return [...items].sort((a, b) => compareValues(readOptionField(a, field), readOptionField(b, field), intl) * direction);
  });
  readonly total = computed(() => this.totalRecords() ?? this.sorted().length);
  readonly pageItems = computed<T[]>(() => {
    const items = this.sorted();
    if (!this.paginator() || this.lazy() || this.totalRecords() !== undefined) return items;
    return items.slice(this.first(), this.first() + this.rows());
  });
  readonly empty = computed(() => this.pageItems().length === 0);
  readonly itemsContext = computed<TxDataViewItemsContext<T>>(() => ({ $implicit: this.pageItems(), items: this.pageItems(), first: this.first() }));
  readonly activeTemplate = computed(() => (this.layout() === 'grid' ? (this.gridTemplate() ?? this.listTemplate()) : (this.listTemplate() ?? this.gridTemplate())));
  readonly layoutKey = computed(() => [this.layout()]);
  readonly showPaginatorTop = computed(() => this.paginator() && this.paginatorPosition() !== 'bottom');
  readonly showPaginatorBottom = computed(() => this.paginator() && this.paginatorPosition() !== 'top');

  constructor() {
    effect(() => {
      const total = this.total();
      const first = untracked(this.first);
      const rows = untracked(this.rows);
      if (this.paginator() && total > 0 && first >= total && rows > 0) {
        untracked(() => this.first.set(Math.max(0, Math.floor((total - 1) / rows) * rows)));
      }
    });

    effect(() => {
      const sortField = this.sortField();
      const sortOrder = this.sortOrder();
      const key = `${sortField}:${sortOrder}`;
      if (!this.lastSort) {
        this.lastSort = key;
        return;
      }
      if (key === this.lastSort) return;
      this.lastSort = key;
      untracked(() => {
        if (this.paginator() && !this.lazy()) this.first.set(0);
        this.sortChange.emit({ sortField, sortOrder });
        this.emitLazyLoad();
      });
    });

    effect(() => {
      const query = this.filterValue();
      if (this.lastFilter === null) {
        this.lastFilter = query;
        return;
      }
      if (query === this.lastFilter) return;
      this.lastFilter = query;
      untracked(() => {
        if (this.paginator()) this.first.set(0);
        this.emitLazyLoad();
      });
    });

    effect(() => {
      if (this.loadedOnce || !this.lazy() || !this.lazyLoadOnInit()) return;
      this.loadedOnce = true;
      untracked(() => this.emitLazyLoad());
    });
  }

  filter(value: string): void {
    this.filterValue.set(value);
  }

  onPage(state: TxPageState): void {
    this.first.set(state.first);
    this.rows.set(state.rows);
    this.pageChange.emit(state);
    this.emitLazyLoad();
  }

  emitLazyLoad(): void {
    if (!this.lazy()) return;
    this.lazyLoad.emit({ first: this.first(), rows: this.rows(), sortField: this.sortField(), sortOrder: this.sortOrder(), filter: this.filterValue() });
  }
}
