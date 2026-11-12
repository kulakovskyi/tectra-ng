import { BreakpointObserver } from '@angular/cdk/layout';
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
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraPaginatorTokens, toStyleObject } from '@tectra-ng/themes';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';
import { map, of, switchMap } from 'rxjs';
import { TxPaginatorEnd, TxPaginatorStart } from './paginator.templates';
import { TxPageState, TxPaginatorPart, TxRowsPerPageItem, TxRowsPerPageOption } from './paginator.types';
import { firstToPage, pageCountOf, pageLinksOf, pageToFirst } from './paginator.utils';
import { PAGINATOR_ICON_DEFAULTS } from './paginator.icons';
import { PAGINATOR_THEME } from './paginator.theme';

@Component({
  selector: 'tx-paginator',
  imports: [NgTemplateOutlet, FormsModule, TxIcon, TxSelect, TxInput],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-paginator',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-paginator--compact]': 'compact()',
    '[class.tx-paginator--with-total]': 'showTotal()',
    '[attr.hidden]': '!visible() || null',
  },
  viewProviders: [provideTxIconDefaults(PAGINATOR_ICON_DEFAULTS)],
})
export class TxPaginator {
  private readonly paginatorTheme = injectTokens(PAGINATOR_THEME);

  private localeService = inject(TxLocaleService);
  private breakpointObserver = inject(BreakpointObserver);

  readonly first = model(0);
  readonly rows = model(0);
  readonly totalRecords = input(0, { transform: numberAttribute });
  readonly pageLinkSize = input(5, { transform: numberAttribute });
  readonly compactPageLinkSize = input(3, { transform: numberAttribute });
  readonly compactBreakpoint = input<string | null>('40rem');
  readonly rowsPerPageOptions = input<TxRowsPerPageOption[] | null | undefined>(undefined);
  readonly alwaysShow = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showFirstLastIcon = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showPageLinks = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showCurrentPageReport = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  readonly showJumpToPageDropdown = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showJumpToPageInput = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showTotal = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly locale = input<string | undefined>(undefined);
  readonly dropdownScrollHeight = input('200px');
  readonly firstPageIcon = input('angle-double-left');
  readonly previousPageIcon = input('angle-left');
  readonly nextPageIcon = input('angle-right');
  readonly lastPageIcon = input('angle-double-right');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraPaginatorTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPaginatorPart, TxPaginator> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly pageChange = output<TxPageState>();

  readonly startTemplate = contentChild(TxPaginatorStart);
  readonly endTemplate = contentChild(TxPaginatorEnd);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('paginator', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-paginator'), ...this.passThrough().root?.style }));

  readonly compact = toSignal(
    toObservable(this.compactBreakpoint).pipe(
      switchMap((breakpoint) =>
        breakpoint ? this.breakpointObserver.observe(`(width < ${breakpoint})`).pipe(map(({ matches }) => matches)) : of(false),
      ),
    ),
    { initialValue: false },
  );

  readonly pageCount = computed(() => pageCountOf(this.totalRecords(), this.rows()));
  readonly page = computed(() => Math.min(firstToPage(this.first(), this.rows()), Math.max(0, this.pageCount() - 1)));
  readonly empty = computed(() => this.pageCount() === 0);
  readonly isFirstPage = computed(() => this.empty() || this.page() === 0);
  readonly isLastPage = computed(() => this.empty() || this.page() === this.pageCount() - 1);
  readonly pageLinks = computed(() =>
    pageLinksOf(this.page(), this.pageCount(), this.compact() ? this.compactPageLinkSize() : this.pageLinkSize()),
  );
  readonly showEnds = computed(() => this.showFirstLastIcon() && !this.compact());
  readonly visible = computed(() => this.alwaysShow() || this.pageCount() > 1);
  readonly state = computed<TxPageState>(() => ({
    page: this.page(),
    first: this.first(),
    rows: this.rows(),
    pageCount: this.pageCount(),
  }));

  readonly rowsPerPageItems = computed<TxRowsPerPageItem[]>(() => {
    const options = this.rowsPerPageOptions();
    if (!options?.length) return [];
    const rows = this.rows();
    const items = options.map((option) =>
      typeof option === 'number'
        ? { label: this.format(option), value: option }
        : { label: option.showAll, value: this.totalRecords() },
    );
    const numbers = options.filter((option): option is number => typeof option === 'number');
    if (rows > 0 && !items.some((item) => item.value === rows)) {
      const merged = [...numbers, rows].sort((a, b) => a - b).map((value) => ({ label: this.format(value), value }));
      return [...merged, ...items.filter((_, index) => typeof options[index] !== 'number')];
    }
    return items;
  });

  readonly jumpToPageItems = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => ({ label: this.format(index + 1), value: index })),
  );

  readonly currentPageReport = computed(() => {
    const total = this.totalRecords();
    const first = this.first();
    const values: Record<string, number> = {
      currentPage: this.empty() ? 0 : this.page() + 1,
      totalPages: this.pageCount(),
      first: total > 0 ? first + 1 : 0,
      last: Math.min(first + this.rows(), total),
      rows: this.rows(),
      totalRecords: total,
    };
    const template = this.currentPageReportTemplate() ?? this.translations().currentPageReport;
    return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? this.format(values[key]) : match));
  });

  readonly totalLabel = computed(() =>
    this.translations().totalCount.replace('{count}', this.format(this.totalRecords())),
  );

  constructor() {
    effect(() => {
      const total = this.totalRecords();
      const pageCount = this.pageCount();
      const first = untracked(this.first);
      if (total > 0 && first >= total && pageCount > 0) {
        untracked(() => this.changePage(pageCount - 1));
      }
    });
  }

  changePage(page: number): void {
    const pageCount = this.pageCount();
    if (this.disabled() || page < 0 || page >= pageCount) return;
    const first = pageToFirst(page, this.rows());
    if (first === this.first() && page === this.page()) return;
    this.first.set(first);
    this.pageChange.emit({ page, first, rows: this.rows(), pageCount });
  }

  changeRows(rows: number | null): void {
    if (rows === null || rows <= 0 || rows === this.rows()) return;
    const page = firstToPage(this.first(), rows);
    const first = pageToFirst(page, rows);
    this.rows.set(rows);
    this.first.set(first);
    this.pageChange.emit({ page, first, rows, pageCount: pageCountOf(this.totalRecords(), rows) });
  }

  jumpTo(input: HTMLInputElement): void {
    const value = Number.parseInt(input.value, 10);
    if (Number.isNaN(value)) {
      input.value = String(this.page() + 1);
      return;
    }
    const page = Math.min(Math.max(value, 1), Math.max(this.pageCount(), 1)) - 1;
    input.value = String(page + 1);
    this.changePage(page);
  }

  pageLabel(page: number): string {
    return this.translations().pageNumber.replace('{page}', this.format(page + 1));
  }

  format(value: number): string {
    return new Intl.NumberFormat(this.locale() ?? this.localeService.locale().intl, { useGrouping: false }).format(value);
  }
}
