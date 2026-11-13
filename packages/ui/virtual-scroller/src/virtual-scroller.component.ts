import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
} from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraVirtualScrollerTokens, toStyleObject } from '@tectra-ng/themes';
import { TxVirtualScrollerContent, TxVirtualScrollerItem, TxVirtualScrollerLoader, TxVirtualScrollerLoadingIcon } from './virtual-scroller.templates';
import {
  TxVirtualScrollerContentContext,
  TxVirtualScrollerItemContext,
  TxVirtualScrollerLazyLoadEvent,
  TxVirtualScrollerOrientation,
  TxVirtualScrollerPart,
  TxVirtualScrollerPosition,
  TxVirtualScrollerRenderedRange,
  TxVirtualScrollerScrollEvent,
} from './virtual-scroller.types';
import { VIRTUAL_SCROLLER_ICON_DEFAULTS } from './virtual-scroller.icons';
import { VIRTUAL_SCROLLER_THEME } from './virtual-scroller.theme';

/** Rendered span of one axis and the visible span inside it, as indexes. */
interface TxAxisRange {
  /** Index of the first rendered item. */
  first: number;
  /** Index after the last rendered item. */
  last: number;
  /** Index of the first visible item. */
  viewFirst: number;
  /** Index after the last visible item. */
  viewLast: number;
}

/** One rendered item with its index. */
interface TxRenderedCell<T> {
  /** Index of the item on its axis. */
  index: number;
  /** The item; `undefined` while it is not loaded. */
  item: T | undefined;
}

/** One rendered row of a `both` grid. */
interface TxRenderedRow<T> {
  /** Index of the row. */
  index: number;
  /** The rendered cells of the row. */
  cells: TxRenderedCell<T>[];
}

/**
 * Renders only the items that fit in its scroll area, so long lists scroll smoothly;
 * vertical, horizontal or as a grid.
 */
@Component({
  selector: 'tx-virtual-scroller',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './virtual-scroller.component.html',
  styleUrl: './virtual-scroller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-virtual-scroller',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-orientation]': 'orientation()',
    '[class.tx-virtual-scroller--disabled]': 'disabled()',
    '[class.tx-virtual-scroller--loading]': 'showLoaderMask()',
    '[attr.tabindex]': 'tabindex()',
    '[attr.role]': 'ariaLabel() || ariaLabelledBy() ? "region" : null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[attr.aria-busy]': 'loading() || null',
    '(scroll)': 'onScroll($event)',
  },
  viewProviders: [provideTxIconDefaults(VIRTUAL_SCROLLER_ICON_DEFAULTS)],
})
export class TxVirtualScroller<T = unknown> {
  private readonly virtualScrollerTheme = injectTokens(VIRTUAL_SCROLLER_THEME);

  readonly items = input<readonly (T | undefined)[] | readonly (readonly (T | undefined)[])[] | null | undefined>(undefined);
  readonly itemSize = input<number | readonly [number, number]>(40);
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly scrollWidth = input<string | undefined>(undefined);
  readonly orientation = input<TxVirtualScrollerOrientation>('vertical');
  readonly numToleratedItems = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly delay = input(0, { transform: numberAttribute });
  readonly step = input(0, { transform: numberAttribute });
  readonly lazy = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly appendOnly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showSpacer = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showLoader = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loadingIcon = input('spinner');
  readonly trackBy = input<((index: number, item: T | undefined) => unknown) | undefined>(undefined);
  readonly tabindex = input(0, { transform: numberAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraVirtualScrollerTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxVirtualScrollerPart, TxVirtualScroller<T>> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly lazyLoad = output<TxVirtualScrollerLazyLoadEvent>();
  readonly scrolled = output<TxVirtualScrollerScrollEvent>();
  readonly scrollIndexChange = output<TxVirtualScrollerRenderedRange['viewport']>();

  readonly itemTemplate = contentChild(TxVirtualScrollerItem);
  readonly loaderTemplate = contentChild(TxVirtualScrollerLoader);
  readonly loadingIconTemplate = contentChild(TxVirtualScrollerLoadingIcon);
  readonly contentTemplate = contentChild(TxVirtualScrollerContent);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);
  private readonly cleanup = this.destroy.onDestroy(() => clearTimeout(this.timer));
  private timer: ReturnType<typeof setTimeout> | undefined;
  private lastLazy = '';
  private lastViewport = '';

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('virtualScroller', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-virtual-scroller'),
    ...(this.scrollHeight() ? { height: this.scrollHeight() } : {}),
    ...(this.scrollWidth() ? { width: this.scrollWidth() } : {}),
    ...this.passThrough().root?.style,
  }));

  readonly scrollTop = signal(0);
  readonly scrollLeft = signal(0);
  readonly viewportHeight = signal(0);
  readonly viewportWidth = signal(0);
  readonly scrolling = signal(false);

  readonly both = computed(() => this.orientation() === 'both');
  readonly horizontal = computed(() => this.orientation() === 'horizontal');
  readonly rowSize = computed(() => {
    const size = this.itemSize();
    return typeof size === 'number' ? size : size[0];
  });
  readonly columnSize = computed(() => {
    const size = this.itemSize();
    return typeof size === 'number' ? size : size[1];
  });
  readonly list = computed(() => (this.items() ?? []) as readonly (T | undefined)[]);
  readonly grid = computed(() => (this.both() ? ((this.items() ?? []) as readonly (readonly (T | undefined)[])[]) : []));
  readonly rowCount = computed(() => (this.horizontal() ? 1 : this.both() ? this.grid().length : this.list().length));
  readonly columnCount = computed(() => {
    if (this.horizontal()) return this.list().length;
    if (!this.both()) return 1;
    return this.grid().reduce((max, row) => Math.max(max, row?.length ?? 0), 0);
  });
  readonly rows = computed(() => (this.horizontal() ? this.fullRange(1) : this.axisRange(this.scrollTop(), this.viewportHeight(), this.rowSize(), this.rowCount())));
  readonly columns = computed(() => {
    if (!this.horizontal() && !this.both()) return this.fullRange(1);
    return this.axisRange(this.scrollLeft(), this.viewportWidth(), this.columnSize(), this.columnCount());
  });
  readonly totalHeight = computed(() => (this.horizontal() ? null : this.rowCount() * this.rowSize()));
  readonly totalWidth = computed(() => (this.horizontal() || this.both() ? this.columnCount() * this.columnSize() : null));
  readonly offsetTop = computed(() => (this.horizontal() ? 0 : this.rows().first * this.rowSize()));
  readonly offsetLeft = computed(() => (this.horizontal() || this.both() ? this.columns().first * this.columnSize() : 0));
  readonly contentTransform = computed(() => `translate3d(${this.offsetLeft()}px, ${this.offsetTop()}px, 0)`);

  readonly renderedItems = computed<TxRenderedCell<T>[]>(() => {
    if (this.both()) return [];
    const { first, last } = this.horizontal() ? this.columns() : this.rows();
    const list = this.list();
    const cells: TxRenderedCell<T>[] = [];
    for (let index = first; index < last; index += 1) cells.push({ index, item: list[index] });
    return cells;
  });
  readonly renderedRows = computed<TxRenderedRow<T>[]>(() => {
    if (!this.both()) return [];
    const rows = this.rows();
    const columns = this.columns();
    const grid = this.grid();
    const result: TxRenderedRow<T>[] = [];
    for (let row = rows.first; row < rows.last; row += 1) {
      const cells: TxRenderedCell<T>[] = [];
      for (let column = columns.first; column < columns.last; column += 1) cells.push({ index: column, item: grid[row]?.[column] });
      result.push({ index: row, cells });
    }
    return result;
  });
  readonly showLoaderMask = computed(() => this.showLoader() && (this.loading() || this.scrolling()) && !this.loaderTemplate());
  readonly showLoaderItems = computed(() => this.showLoader() && (this.loading() || this.scrolling()) && !!this.loaderTemplate());
  readonly contentContext = computed<TxVirtualScrollerContentContext<T | undefined>>(() => {
    const items = this.renderedItems().map((cell) => cell.item);
    const range = this.horizontal() ? this.columns() : this.rows();
    return {
      $implicit: items,
      items,
      first: range.first,
      last: range.last,
      count: this.horizontal() ? this.columnCount() : this.rowCount(),
      spacerBefore: this.horizontal() ? this.offsetLeft() : this.offsetTop(),
      itemSize: this.horizontal() ? this.columnSize() : this.rowSize(),
    };
  });

  constructor() {
    afterNextRender(() => {
      this.measure();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(this.host.nativeElement);
      this.destroy.onDestroy(() => observer.disconnect());
    });

    effect(() => {
      if (!this.lazy()) return;
      const range = this.horizontal() ? this.columns() : this.rows();
      const step = this.step();
      const count = this.horizontal() ? this.columnCount() : this.rowCount();
      const first = step > 0 ? Math.floor(range.first / step) * step : range.first;
      const last = step > 0 ? Math.min(Math.max(count, range.last), Math.ceil(range.last / step) * step) : range.last;
      const key = `${first}:${last}`;
      if (key === this.lastLazy) return;
      this.lastLazy = key;
      untracked(() => this.lazyLoad.emit({ first, last }));
    });

    effect(() => {
      const viewport = this.renderedRange().viewport;
      const key = JSON.stringify(viewport);
      if (key === this.lastViewport) return;
      this.lastViewport = key;
      untracked(() => this.scrollIndexChange.emit(viewport));
    });
  }

  readonly renderedRange = computed<TxVirtualScrollerRenderedRange>(() => {
    const rows = this.rows();
    const columns = this.columns();
    if (this.both()) {
      return {
        first: [rows.first, columns.first],
        last: [rows.last, columns.last],
        viewport: { first: [rows.viewFirst, columns.viewFirst], last: [rows.viewLast, columns.viewLast] },
      };
    }
    const range = this.horizontal() ? columns : rows;
    return { first: range.first, last: range.last, viewport: { first: range.viewFirst, last: range.viewLast } };
  });

  getRenderedRange(): TxVirtualScrollerRenderedRange {
    return this.renderedRange();
  }

  trackOf(index: number, item: T | undefined): unknown {
    const own = this.trackBy();
    return own ? own(index, item) : index;
  }

  itemContext(cell: TxRenderedCell<T>, count: number): TxVirtualScrollerItemContext<T | undefined> {
    return {
      $implicit: cell.item,
      index: cell.index,
      count,
      first: cell.index === 0,
      last: cell.index === count - 1,
      even: cell.index % 2 === 0,
      odd: cell.index % 2 === 1,
    };
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const top = element.scrollTop;
    const left = element.scrollLeft;
    this.scrolled.emit({ originalEvent: event });
    const apply = () => {
      this.scrollTop.set(top);
      this.scrollLeft.set(left);
      this.viewportHeight.set(element.clientHeight);
      this.viewportWidth.set(element.clientWidth);
      this.scrolling.set(false);
    };
    if (this.delay() > 0) {
      clearTimeout(this.timer);
      this.scrolling.set(true);
      this.timer = setTimeout(apply, this.delay());
    } else {
      apply();
    }
  }

  scrollTo(options: ScrollToOptions): void {
    const element = this.host.nativeElement;
    element.scrollTo?.(options);
    if (options.behavior === 'smooth') return;
    if (options.top !== undefined) this.scrollTop.set(Math.max(0, options.top));
    if (options.left !== undefined) this.scrollLeft.set(Math.max(0, options.left));
  }

  scrollToIndex(index: TxVirtualScrollerPosition, behavior: ScrollBehavior = 'auto'): void {
    const [row, column] = this.positionOf(index);
    this.scrollTo({ top: row * this.rowSize(), left: column * this.columnSize(), behavior });
  }

  scrollInView(index: TxVirtualScrollerPosition, to: 'to-start' | 'to-end', behavior: ScrollBehavior = 'auto'): void {
    const [row, column] = this.positionOf(index);
    if (to === 'to-start') {
      this.scrollToIndex(index, behavior);
      return;
    }
    this.scrollTo({
      top: Math.max(0, (row + 1) * this.rowSize() - this.viewportHeight()),
      left: Math.max(0, (column + 1) * this.columnSize() - this.viewportWidth()),
      behavior,
    });
  }

  refresh(): void {
    this.measure();
  }

  private positionOf(index: TxVirtualScrollerPosition): [number, number] {
    if (typeof index !== 'number') return [index[0], index[1]];
    return this.horizontal() ? [0, index] : [index, 0];
  }

  private measure(): void {
    const element = this.host.nativeElement;
    this.viewportHeight.set(element.clientHeight);
    this.viewportWidth.set(element.clientWidth);
  }

  private fullRange(count: number): TxAxisRange {
    return { first: 0, last: count, viewFirst: 0, viewLast: count };
  }

  private axisRange(scroll: number, viewport: number, size: number, count: number): TxAxisRange {
    if (this.disabled() || size <= 0) return this.fullRange(count);
    const space = viewport || size * 10;
    const visible = Math.ceil(space / size);
    const tolerance = this.numToleratedItems() ?? Math.ceil(visible / 2);
    const viewFirst = Math.min(count, Math.floor(scroll / size));
    const viewLast = Math.min(count, Math.ceil((scroll + space) / size));
    const first = this.appendOnly() ? 0 : Math.max(0, viewFirst - tolerance);
    const last = Math.min(count, viewLast + tolerance);
    return { first, last, viewFirst, viewLast };
  }
}
